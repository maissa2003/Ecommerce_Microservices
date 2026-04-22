import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionsService } from '../../../services/sessions.service';
import { Session } from '../../../models/session.model';

@Component({
  selector: 'app-learner-session-table',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './learner-session-table.component.html',
  styleUrls: ['./learner-session-table.component.css']
})
export class LearnerSessionTableComponent implements OnInit {
  sessions: Session[] = [];
  filteredSessions: Session[] = [];
  currentUserId!: number;
  loading = false;
  searchTerm = '';
  activeFilter = 'all';

  filters = [
    { value: 'all', label: 'All Sessions', icon: 'fa-globe', count: 0 },
    { value: 'ongoing', label: 'Ongoing', icon: 'fa-play-circle', count: 0 },
    { value: 'upcoming', label: 'Upcoming', icon: 'fa-calendar-alt', count: 0 },
    { value: 'ended', label: 'Ended', icon: 'fa-flag-checkered', count: 0 }
  ];

  constructor(
    private sessionsService: SessionsService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId()!;
    this.loadSessions();
  }

  loadSessions() {
    this.sessionsService.getAllSessions().subscribe({
      next: (data: Session[]) => {
        this.sessions = data.filter((s: Session) => s.type === 'ONLINE');
        this.updateFilterCounts();
        this.applyFilters();
      },
      error: err => {
        console.error('Error loading sessions:', err);
      }
    });
  }

  updateFilterCounts(): void {
    this.filters.forEach(filter => {
      if (filter.value === 'all') {
        filter.count = this.sessions.length;
      } else {
        filter.count = this.sessions.filter(
          s => this.getSessionStatus(s).toLowerCase() === filter.value
        ).length;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.sessions];

    // Apply status filter
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(
        s => this.getSessionStatus(s).toLowerCase() === this.activeFilter
      );
    }

    // Apply search filter - fixed without description
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(term) ||
          s.user?.username?.toLowerCase().includes(term)
      );
    }

    this.filteredSessions = filtered;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  clearFilters(): void {
    this.activeFilter = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  getTotalParticipants(): number {
    return this.sessions.reduce(
      (total, session) => total + (session.participants?.length || 0),
      0
    );
  }

  isJoined(session: Session): boolean {
    return (
      session.participants?.some((p: any) => p.id === this.currentUserId) ??
      false
    );
  }

  isFull(session: Session): boolean {
    return (session.participants?.length ?? 0) >= session.capacity;
  }

  getSessionStatus(session: Session): string {
    const now = new Date();
    const start = new Date(session.startAt);
    const end = new Date(session.endAt);
    if (now < start) return 'UPCOMING';
    if (now > end) return 'ENDED';
    return 'ONGOING';
  }

  getRemainingSpots(session: Session): number {
    return session.capacity - (session.participants?.length || 0);
  }

  getProgressPercentage(session: Session): number {
    return ((session.participants?.length || 0) / session.capacity) * 100;
  }

  joinSession(session: Session) {
    if (this.isJoined(session) || this.isFull(session)) return;

    this.loading = true;

    if (!session.participants) session.participants = [];
    session.participants.push({ id: this.currentUserId } as any);

    this.sessionsService.joinSession(session.id!).subscribe({
      next: (updatedSession: any) => {
        this.loading = false;

        // Fetch full session to get roomCode and redirect to live meet
        this.sessionsService.getSessionById(updatedSession.id!).subscribe({
          next: (fullSession: any) => {
            if (fullSession.type === 'ONLINE' && fullSession.room?.roomCode) {
              // Navigate to live meet component immediately
              this.router.navigate([
                '/live',
                fullSession.id,
                fullSession.room.roomCode
              ]);
            } else {
              // For non-online sessions, just reload
              this.loadSessions();
            }
          },
          error: err => {
            console.error('Error fetching session details:', err);
            this.loading = false;
            this.loadSessions();
          }
        });
      },
      error: (err: any) => {
        console.error('Error joining session:', err);
        this.loading = false;
        session.participants = session.participants?.filter(
          (p: any) => p.id !== this.currentUserId
        );
      }
    });
  }

  // Re-enter room for already-joined ONLINE sessions
  enterRoom(session: Session) {
    this.loading = true;
    this.sessionsService.getSessionById(session.id!).subscribe({
      next: (fullSession: any) => {
        this.loading = false;
        if (fullSession.room?.roomCode) {
          this.router.navigate([
            '/live',
            fullSession.id,
            fullSession.room.roomCode
          ]);
        }
      },
      error: err => {
        console.error('Error fetching session for room entry:', err);
        this.loading = false;
      }
    });
  }

  // Format date for display
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Check if session is starting soon (within 30 minutes)
  isStartingSoon(session: Session): boolean {
    const now = new Date();
    const start = new Date(session.startAt);
    const diffMinutes = (start.getTime() - now.getTime()) / (1000 * 60);
    return diffMinutes > 0 && diffMinutes <= 30;
  }

  // Get time until session starts
  getTimeUntilStart(session: Session): string {
    const now = new Date();
    const start = new Date(session.startAt);
    const diffMs = start.getTime() - now.getTime();

    if (diffMs <= 0) return 'Started';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  }
}
