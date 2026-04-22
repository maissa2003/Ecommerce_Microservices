import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TrainerApplicationFoService } from '../../services/trainer-application-fo.service';
import { AuthService } from '../../../../modules/services/auth.service';

type AppStatus = 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED';

@Component({
  selector: 'app-trainer-home',
  templateUrl: './trainer-home.component.html',
  styleUrls: ['./trainer-home.component.scss']
})
export class TrainerHomeComponent implements OnInit {
  userId: number | null = null;

  loading = false;
  errorMsg = '';

  app: any | null = null;
  status: AppStatus = 'NONE';

  // (optionnel) mini-stats statiques pour look pro
  stats = {
    courses: 0,
    students: 0,
    earnings: 0
  };

  constructor(
    private router: Router,
    private appService: TrainerApplicationFoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId();
    if (this.userId) {
      this.loadStatus();
    } else {
      // Pas connecté => on montre "NONE" + CTA apply
      this.userId = null;
      this.status = 'NONE';
    }
  }

  loadStatus(): void {
    if (!this.userId) {
      this.status = 'NONE';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.appService.getByUserId(this.userId).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.app = data || null;

        const raw = (data?.status || 'PENDING').toUpperCase();

        if (raw.includes('ACCEPT')) this.status = 'ACCEPTED';
        else if (raw.includes('REJECT')) this.status = 'REJECTED';
        else this.status = 'PENDING';
      },
      error: (err: any) => {
        this.loading = false;

        // ✅ 404 => pas de candidature => NORMAL
        if (err?.status === 404) {
          this.app = null;
          this.status = 'NONE';
          this.errorMsg = '';
          return;
        }

        // ✅ 500 / autres => on ne panique pas côté UX
        // On affiche NONE sans alerte (page home doit rester clean)
        this.app = null;
        this.status = 'NONE';
        this.errorMsg = ''; // ✅ on cache l'erreur au user
      }
    });
  }

  // ✅ CTA routing helpers
  goApply(): void {
    this.router.navigate(['/trainer-portal/apply']);
  }

  goMyApplication(): void {
    this.router.navigate(['/trainer-portal/my-application']);
  }

  goMyProfile(): void {
    this.router.navigate(['/trainer-portal/my-profile']);
  }

  // (optionnel) bouton futur
  goCreateCourse(): void {
    // Change this route when you implement it
    this.router.navigate(['/trainer/courses/create']);
  }

  get statusLabel(): string {
    switch (this.status) {
      case 'NONE':
        return 'Not submitted';
      case 'PENDING':
        return 'Pending review';
      case 'ACCEPTED':
        return 'Accepted';
      case 'REJECTED':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  get statusClass(): string {
    switch (this.status) {
      case 'PENDING':
        return 'wait';
      case 'ACCEPTED':
        return 'ok';
      case 'REJECTED':
        return 'bad';
      default:
        return 'neutral';
    }
  }
}
