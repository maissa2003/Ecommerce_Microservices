import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ExamsService } from '../../services/exams.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-certificate-list',
  templateUrl: './certificate-list.component.html',
  styleUrls: ['./certificate-list.component.scss']
})
export class CertificateListComponent implements OnInit, AfterViewInit {
  certificates: any[] = [];
  loading = false;
  userNames: Map<number, string> = new Map();
  signatureSaved = false;

  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;

  private apiBase = 'http://localhost:8090';

  constructor(
    private examsService: ExamsService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  loadCertificates(): void {
    this.loading = true;
    this.examsService.getAllCertificates().subscribe({
      next: data => {
        this.certificates = data;
        this.loading = false;
        // Load usernames for all unique userIds
        const ids = [
          ...new Set(
            data
              .map((c: any) => c.evaluation?.userId ?? c.userId)
              .filter(Boolean)
          )
        ];
        this.loadUserNames(ids as number[]);
      },
      error: error => {
        console.error('Error loading certificates:', error);
        this.loading = false;
      }
    });
  }

  loadUserNames(userIds: number[]): void {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('access_token') ||
      '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    userIds.forEach(id => {
      if (!this.userNames.has(id)) {
        this.http
          .get<any>(`${this.apiBase}/api/admin/users/${id}`, { headers })
          .subscribe({
            next: user => this.userNames.set(id, user.username),
            error: () => this.userNames.set(id, `User #${id}`)
          });
      }
    });
  }

  getUserName(cert: any): string {
    const userId = cert.evaluation?.userId ?? cert.userId;
    return this.userNames.get(userId) || `User #${userId}`;
  }

  // ───────── Signature drawing (admin) ─────────

  private initCanvas(): void {
    if (!this.signatureCanvas) return;
    const canvas = this.signatureCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      const saved = localStorage.getItem('certificate_signature_image');
      if (saved) {
        const img = new Image();
        img.onload = () => {
          this.ctx?.clearRect(0, 0, canvas.width, canvas.height);
          this.ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = saved;
      }
    }
  }

  startDrawing(event: PointerEvent): void {
    if (!this.ctx || !this.signatureCanvas) return;
    this.drawing = true;
    const pos = this.getPos(event);
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  drawMove(event: PointerEvent): void {
    if (!this.drawing || !this.ctx || !this.signatureCanvas) return;
    event.preventDefault();
    const pos = this.getPos(event);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  stopDrawing(): void {
    this.drawing = false;
  }

  private getPos(event: PointerEvent): { x: number; y: number } {
    const canvas = this.signatureCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  clearSignature(): void {
    const canvas = this.signatureCanvas?.nativeElement;
    if (!canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem('certificate_signature_image');
  }

  saveSignature(): void {
    const canvas = this.signatureCanvas?.nativeElement;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    localStorage.setItem('certificate_signature_image', dataUrl);
    this.signatureSaved = true;
    setTimeout(() => (this.signatureSaved = false), 2000);
  }

  getLevel(cert: any): string {
    if (cert.level) return cert.level;
    const score = cert.evaluation?.score ?? cert.score ?? 0;
    if (score >= 90) return 'GOLD';
    if (score >= 70) return 'SILVER';
    return 'BRONZE';
  }

  deleteCertificate(id: number): void {
    if (confirm('Are you sure you want to delete this certificate?')) {
      this.examsService.deleteCertificate(id).subscribe({
        next: () => this.loadCertificates(),
        error: () => console.error('Error deleting certificate')
      });
    }
  }
}
