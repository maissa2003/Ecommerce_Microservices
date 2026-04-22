import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from '../../services/auth.service';
import { SessionsService } from '../../services/sessions.service';
import { Session } from '../../models/session.model';

interface Participant {
  username: string;
  online: boolean;
  stream?: MediaStream;
  cameraOn?: boolean;
  isTrainer?: boolean;
}

@Component({
  selector: 'app-live-meet',
  templateUrl: './live-meet.component.html',
  styleUrls: ['./live-meet.component.css']
})
export class LiveMeetComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;

  sessionId!: number;
  roomCode!: string;
  username!: string;
  session!: Session;

  participantMap: Map<string, Participant> = new Map();

  get participants(): Participant[] {
    return Array.from(this.participantMap.values());
  }

  private localStream!: MediaStream;
  private stompClient!: Client;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();

  micEnabled = true;
  cameraEnabled = false;

  private readonly iceServers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private sessionsService: SessionsService,
    private cdr: ChangeDetectorRef
  ) {}

  // ─────────────────────────────────────────────
  //  Role helper
  // ─────────────────────────────────────────────

  get isTrainer(): boolean {
    const roles = this.authService.getCurrentUser()?.roles ?? [];
    return roles.includes('ROLE_TRAINER');
  }

  // ─────────────────────────────────────────────
  //  Init
  // ─────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    this.sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));
    this.roomCode = this.route.snapshot.paramMap.get('roomCode')!;
    this.username = this.authService.getCurrentUser()?.username ?? 'unknown';

    this.loadSessionParticipants();
    await this.initMedia();
    this.connectWebSocket();
  }

  // ─────────────────────────────────────────────
  //  Load DB participants
  // ─────────────────────────────────────────────

  loadSessionParticipants() {
    this.sessionsService.getSessionById(this.sessionId).subscribe({
      next: session => {
        this.session = session;
        (session.participants || []).forEach(p => {
          if (p.username !== this.username) {
            this.participantMap.set(p.username, {
              username: p.username,
              online: false,
              cameraOn: false,
              isTrainer: false
            });
          }
        });
      },
      error: err => console.error('❌ Failed to load session:', err)
    });
  }

  // ─────────────────────────────────────────────
  //  Media - audio only at start
  // ─────────────────────────────────────────────

  async initMedia() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('Your browser does not support audio/video access');
        return;
      }
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
      });
      console.log('✅ Audio stream obtained');
    } catch (error) {
      console.error('❌ Media error:', error);
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError')
          alert('Microphone access denied. Please allow and refresh.');
        else if (error.name === 'NotFoundError') alert('No microphone found.');
        else alert(`Media error: ${error.message}`);
      }
    }
  }

  // ─────────────────────────────────────────────
  //  Toggle Camera
  // ─────────────────────────────────────────────

  async toggleCamera() {
    this.cameraEnabled = !this.cameraEnabled;

    if (this.cameraEnabled) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        const videoTrack = videoStream.getVideoTracks()[0];

        this.localStream.addTrack(videoTrack);

        if (this.localVideo?.nativeElement) {
          this.localVideo.nativeElement.srcObject = this.localStream;
          this.localVideo.nativeElement.muted = true;
          await this.localVideo.nativeElement.play().catch(() => {});
        }

        for (const [remoteUsername, pc] of this.peerConnections) {
          pc.addTrack(videoTrack, this.localStream);
          await this.createAndSendOffer(remoteUsername, pc);
        }

        this.sendSignal({ type: 'CAMERA_ON', username: this.username });
        console.log('📹 Camera started');
      } catch (err) {
        console.error('❌ Camera error:', err);
        this.cameraEnabled = false;
        alert('Could not access camera. Please check permissions.');
      }
    } else {
      this.localStream.getVideoTracks().forEach(track => {
        track.stop();
        this.localStream.removeTrack(track);
      });

      if (this.localVideo?.nativeElement) {
        this.localVideo.nativeElement.srcObject = null;
      }

      this.sendSignal({ type: 'CAMERA_OFF', username: this.username });
      console.log('📹 Camera stopped');
    }
  }

  // ─────────────────────────────────────────────
  //  WebSocket / Signaling
  // ─────────────────────────────────────────────

  connectWebSocket() {
    const token = this.authService.getToken();
    this.stompClient = new Client({
      webSocketFactory: () =>
        new SockJS(`http://localhost:8090/ws?token=${token}`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ WebSocket connected');

        this.stompClient.subscribe(
          `/topic/room/${this.roomCode}`,
          (message: IMessage) => this.handleSignal(JSON.parse(message.body))
        );

        this.stompClient.subscribe(
          `/user/queue/signal`,
          (message: IMessage) => {
            console.log('🔒 Private message raw:', message.body);
            this.handlePrivateSignal(JSON.parse(message.body));
          }
        );
        console.log('✅ Subscribed to private channel');

        // ✅ Send JOIN with isTrainer flag
        this.sendSignal({
          type: 'JOIN',
          username: this.username,
          isTrainer: this.isTrainer
        });
      },
      onDisconnect: () => console.log('🔌 WebSocket disconnected')
    });

    this.stompClient.activate();
  }

  // ─────────────────────────────────────────────
  //  Handle broadcast signals
  // ─────────────────────────────────────────────

  async handleSignal(message: any) {
    if (message.username === this.username) return;
    console.log('📨 Broadcast signal:', message.type, 'from', message.username);

    switch (message.type) {
      case 'JOIN':
        this.participantMap.set(message.username, {
          username: message.username,
          online: true,
          cameraOn: false,
          isTrainer: message.isTrainer ?? false // ✅ Save trainer flag
        });
        // ✅ Send HERE with our isTrainer flag too
        this.sendSignal({
          type: 'HERE',
          username: this.username,
          isTrainer: this.isTrainer
        });
        await this.initiatePeerConnection(message.username);
        this.cdr.detectChanges();
        break;

      case 'HERE':
        this.participantMap.set(message.username, {
          username: message.username,
          online: true,
          cameraOn: false,
          isTrainer: message.isTrainer ?? false // ✅ Save trainer flag
        });
        await this.initiatePeerConnection(message.username);
        this.cdr.detectChanges();
        break;

      case 'LEAVE':
        const p = this.participantMap.get(message.username);
        if (p) p.online = false;
        this.closePeerConnection(message.username);
        this.cdr.detectChanges();
        break;

      case 'CAMERA_ON':
        const pOn = this.participantMap.get(message.username);
        if (pOn) pOn.cameraOn = true;
        this.cdr.detectChanges();
        break;

      case 'CAMERA_OFF':
        const pOff = this.participantMap.get(message.username);
        if (pOff) {
          pOff.cameraOn = false;
          pOff.stream = undefined;
        }
        this.cdr.detectChanges();
        break;
    }
  }

  // ─────────────────────────────────────────────
  //  Handle private WebRTC signals
  // ─────────────────────────────────────────────

  async handlePrivateSignal(message: any) {
    console.log('🔒 Private signal:', message.type, 'from', message.from);
    switch (message.type) {
      case 'OFFER':
        await this.handleOffer(message);
        break;
      case 'ANSWER':
        await this.handleAnswer(message);
        break;
      case 'ICE_CANDIDATE':
        await this.handleIceCandidate(message);
        break;
    }
  }

  // ─────────────────────────────────────────────
  //  WebRTC peer connection management
  // ─────────────────────────────────────────────

  async initiatePeerConnection(remoteUsername: string) {
    const pc = this.createPeerConnection(remoteUsername);
    await this.createAndSendOffer(remoteUsername, pc);
  }

  createPeerConnection(remoteUsername: string): RTCPeerConnection {
    this.closePeerConnection(remoteUsername);

    const pc = new RTCPeerConnection(this.iceServers);

    this.localStream?.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream);
    });

    pc.ontrack = event => {
      console.log(
        '📡 Remote track received from',
        remoteUsername,
        event.track.kind
      );
      const participant = this.participantMap.get(remoteUsername);
      if (participant) {
        participant.stream = event.streams[0];
        if (event.track.kind === 'video') participant.cameraOn = true;
        this.cdr.detectChanges();
      }
    };

    pc.onicecandidate = event => {
      if (event.candidate) {
        this.sendPrivateSignal(remoteUsername, {
          type: 'ICE_CANDIDATE',
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`🔗 ${remoteUsername} connection:`, pc.connectionState);
    };

    this.peerConnections.set(remoteUsername, pc);
    return pc;
  }

  async createAndSendOffer(remoteUsername: string, pc: RTCPeerConnection) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.sendPrivateSignal(remoteUsername, { type: 'OFFER', sdp: offer.sdp });
    console.log('📤 Offer sent to', remoteUsername);
  }

  async handleOffer(message: any) {
    const pc = this.createPeerConnection(message.from);
    await pc.setRemoteDescription(
      new RTCSessionDescription({ type: 'offer', sdp: message.sdp })
    );
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.sendPrivateSignal(message.from, { type: 'ANSWER', sdp: answer.sdp });
    console.log('📤 Answer sent to', message.from);
  }

  async handleAnswer(message: any) {
    const pc = this.peerConnections.get(message.from);
    if (pc) {
      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp: message.sdp })
      );
      console.log('✅ Answer set from', message.from);
    }
  }

  async handleIceCandidate(message: any) {
    const pc = this.peerConnections.get(message.from);
    if (pc && message.candidate) {
      await pc.addIceCandidate(
        new RTCIceCandidate({
          candidate: message.candidate,
          sdpMid: message.sdpMid,
          sdpMLineIndex: message.sdpMLineIndex
        })
      );
    }
  }

  closePeerConnection(remoteUsername: string) {
    const pc = this.peerConnections.get(remoteUsername);
    if (pc) {
      pc.close();
      this.peerConnections.delete(remoteUsername);
    }
  }

  // ─────────────────────────────────────────────
  //  Signal helpers
  // ─────────────────────────────────────────────

  sendSignal(payload: any) {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: '/app/signal',
        body: JSON.stringify({
          ...payload,
          roomCode: this.roomCode,
          from: this.username
        })
      });
    }
  }

  sendPrivateSignal(toUsername: string, payload: any) {
    console.log('📤 Sending private signal to:', toUsername, payload.type);
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: '/app/signal',
        body: JSON.stringify({
          ...payload,
          roomCode: this.roomCode,
          from: this.username,
          to: toUsername
        })
      });
    }
  }

  // ─────────────────────────────────────────────
  //  UI helpers
  // ─────────────────────────────────────────────

  getInitials(username: string): string {
    if (!username) return '?';
    return username.substring(0, 2).toUpperCase();
  }

  toggleMic() {
    this.micEnabled = !this.micEnabled;
    const track = this.localStream?.getAudioTracks()[0];
    if (track) track.enabled = this.micEnabled;
  }

  attachStream(videoEl: HTMLVideoElement, stream: MediaStream) {
    if (videoEl && stream && videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
      videoEl.play().catch(() => {});
    }
  }

  // ─────────────────────────────────────────────
  //  Leave session
  // ─────────────────────────────────────────────

  leaveSession() {
    this.sendSignal({ type: 'LEAVE', username: this.username });

    this.sessionsService.leaveSession(this.sessionId).subscribe({
      next: () => {
        this.cleanup();
        this.router.navigate(['/user/sessions']); // learner success path
      },
      error: err => {
        console.warn(
          'Leave skipped (trainer or not a participant):',
          err.error
        );
        this.cleanup();
        if (this.isTrainer) {
          this.router.navigate(['/trainer/virtualrooms']); // ✅ trainer path
        } else {
          this.router.navigate(['/user/sessions']); // ✅ learner path
        }
      }
    });
  }

  private cleanup() {
    this.localStream?.getTracks().forEach(t => t.stop());
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.stompClient?.deactivate();
  }

  ngOnDestroy(): void {
    this.sendSignal({ type: 'LEAVE', username: this.username });
    this.cleanup();
  }
}
