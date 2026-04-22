import { Component, OnInit, OnDestroy } from '@angular/core';
import { TrainerApplicationService } from '../../services/trainer-application.service';
import { AuthService } from '../../../../modules/services/auth.service';

@Component({
  selector: 'app-trainer-my-application',
  templateUrl: './trainer-my-application.component.html',
  styleUrls: ['./trainer-my-application.component.scss']
})
export class TrainerMyApplicationComponent implements OnInit, OnDestroy {
  userId: number | null = null;
  loading = false;
  errorMsg = '';
  successMsg = '';
  app: any | null = null;
  details: any | null = null;
  editCvUrl = '';
  editMotivation = '';
  editMode = false;

  // ✅ Polling
  private pollInterval: any = null;
  private lastStatus: string = '';

  // ✅ Notification
  notification: string = '';
  notificationType: 'success' | 'info' | 'warning' = 'info';
  private notifTimeout: any = null;

  constructor(
    private appService: TrainerApplicationService,
    private authService: AuthService // ← add this
  ) {}
  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId(); // ✅ reads 'user' key correctly

    if (this.userId) {
      this.load();
      this.startPolling();
    } else {
      this.errorMsg = 'Not logged in.';
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  // ─── POLLING ──────────────────────────────────────────
  startPolling(): void {
    this.pollInterval = setInterval(() => {
      this.checkStatusChange();
    }, 10000); // toutes les 30 secondes
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
  checkStatusChange(): void {
    if (!this.userId) return;

    this.appService.getByUserId(this.userId).subscribe({
      next: (data: any) => {
        const newStatus = (data?.status || '').toUpperCase();

        // ✅ initialise lastStatus si vide (premier poll)
        if (!this.lastStatus) {
          this.lastStatus = newStatus;
          return;
        }

        if (newStatus !== this.lastStatus) {
          this.app = data;
          this.editCvUrl = data?.cvUrl || '';
          this.editMotivation = data?.motivation || '';
          this.editMode = false;

          if (newStatus === 'ACCEPTED') {
            this.showNotification(
              '🎉 Congratulations! Your application has been accepted!',
              'success'
            );
          } else if (newStatus === 'REJECTED') {
            this.showNotification(
              '❌ Your application has been reviewed. Unfortunately it was not accepted this time.',
              'warning'
            );
          } else {
            this.showNotification(
              `🔔 Your application status changed to ${newStatus}`,
              'info'
            );
          }

          this.lastStatus = newStatus;
        }
      },
      error: () => {}
    });
  }

  showNotification(msg: string, type: 'success' | 'info' | 'warning'): void {
    this.notification = msg;
    this.notificationType = type;

    // auto-dismiss après 8 secondes
    if (this.notifTimeout) clearTimeout(this.notifTimeout);
    this.notifTimeout = setTimeout(() => {
      this.notification = '';
    }, 8000);
  }

  dismissNotification(): void {
    this.notification = '';
    if (this.notifTimeout) clearTimeout(this.notifTimeout);
  }

  // ─── LOAD ─────────────────────────────────────────────
  load(): void {
    if (!this.userId) return;
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.appService.getByUserId(this.userId).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.app = data;
        this.lastStatus = (data?.status || '').toUpperCase(); // ✅ init lastStatus
        this.editMode = false;
        this.editCvUrl = data?.cvUrl || '';
        this.editMotivation = data?.motivation || '';

        if (data?.id) {
          this.loadDetails(data.id);
        }
      },
      error: (err: any) => {
        this.loading = false;
        if (err?.status === 404 || err?.status === 500) {
          this.app = null;
          this.editMode = false;
          return;
        }
        this.errorMsg = `❌ Error (${err?.status || '???'})`;
        this.app = null;
      }
    });
  }

  loadDetails(applicationId: number): void {
    this.appService.getDetailsByApplicationId(applicationId).subscribe({
      next: (data: any) => {
        this.details = data;
      },
      error: () => {
        this.details = null;
      }
    });
  }

  // ─── GETTERS ──────────────────────────────────────────
  get isPending(): boolean {
    return (this.app?.status || 'PENDING').toUpperCase() === 'PENDING';
  }

  get canEdit(): boolean {
    return !!this.app && this.isPending && this.editMode;
  }

  get scoreColor(): string {
    const c = this.extractConfidence();
    if (c >= 80) return 'score-high';
    if (c >= 60) return 'score-mid';
    return 'score-low';
  }

  extractConfidence(): number {
    if (!this.details?.aiSummary) return 0;
    const match = this.details.aiSummary.match(/Confidence.*?(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  badgeClass(status: string): string {
    const s = (status || '').toUpperCase();
    if (s.includes('ACCEPT')) return 'ok';
    if (s.includes('REJECT')) return 'bad';
    return 'wait';
  }

  levelClass(level: string): string {
    const l = (level || '').toUpperCase();
    if (l === 'SENIOR') return 'level-senior';
    if (l === 'MID') return 'level-mid';
    return 'level-junior';
  }

  // ─── ACTIONS ──────────────────────────────────────────
  toggleEdit(): void {
    if (!this.app || !this.isPending) return;
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.editCvUrl = this.app?.cvUrl || '';
      this.editMotivation = this.app?.motivation || '';
      this.successMsg = '';
      this.errorMsg = '';
    }
  }

  save(): void {
    if (!this.app?.id || !this.canEdit) return;
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.appService
      .update(this.app.id, {
        cvUrl: this.editCvUrl?.trim(),
        motivation: this.editMotivation?.trim()
      })
      .subscribe({
        next: (updated: any) => {
          this.loading = false;
          this.app = updated;
          this.editMode = false;
          this.editCvUrl = updated?.cvUrl || '';
          this.editMotivation = updated?.motivation || '';
          this.successMsg = '✅ Application updated successfully.';
        },
        error: (err: any) => {
          this.loading = false;
          this.errorMsg = `❌ Error (${err?.status || '???'})`;
        }
      });
  }

  remove(): void {
    if (!this.app?.id) return;
    if (!confirm('Delete your application?')) return;
    this.loading = true;
    this.stopPolling(); // ✅ stop polling si on supprime

    this.appService.delete(this.app.id).subscribe({
      next: () => {
        this.loading = false;
        this.app = null;
        this.details = null;
        this.editMode = false;
        this.lastStatus = '';
        this.successMsg = '✅ Application deleted.';
      },
      error: (err: any) => {
        this.loading = false;
        this.startPolling(); // ✅ relance si erreur
        this.errorMsg = `❌ Error (${err?.status || '???'})`;
      }
    });
  }
}
