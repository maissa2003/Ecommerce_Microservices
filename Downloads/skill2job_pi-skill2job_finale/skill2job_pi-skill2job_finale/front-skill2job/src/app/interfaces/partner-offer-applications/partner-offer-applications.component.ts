import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApplicationService,
  ApplicationResponse,
  ApplicationStatus,
  ScheduleInterviewRequest
} from '../../modules/services/application.service';
import { JobOfferService } from '../../modules/services/job-offer.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type PreviewType = 'pdf' | 'text';

@Component({
  selector: 'app-partner-offer-applications',
  templateUrl: './partner-offer-applications.component.html',
  styleUrls: ['./partner-offer-applications.component.scss']
})
export class PartnerOfferApplicationsComponent implements OnInit {
  offerId!: number;
  offerTitle: string = 'Offer';

  apps: ApplicationResponse[] = [];
  filtered: ApplicationResponse[] = [];

  loading = false;
  error = '';

  statusFilter: 'ALL' | ApplicationResponse['status'] = 'ALL';
  sortMode: 'NEWEST' | 'OLDEST' | 'SCORE' = 'NEWEST';

  // ✅ PREVIEW MODAL
  previewOpen = false;
  previewTitle = '';
  previewType: PreviewType = 'pdf';
  previewUrl: SafeResourceUrl | null = null;
  previewRawUrl: string | null = null;
  previewText: string | null = null;

  // ✅ INTERVIEW MODAL
  interviewOpen = false;
  interviewSubmitting = false;
  interviewError = '';
  interviewApp: ApplicationResponse | null = null;

  meetLink = '';
  interviewAtLocal = '';
  interviewNote = '';

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private jobOfferService: JobOfferService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || Number.isNaN(id) || id <= 0) {
      this.error = 'Invalid offer ID.';
      return;
    }

    this.offerId = id;
    this.loadOfferTitle();
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.applicationService.getApplicationsForOffer(this.offerId).subscribe({
      next: data => {
        this.apps = data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Unable to load applications.';
      }
    });
  }

  loadOfferTitle(): void {
    this.jobOfferService.getOfferById(this.offerId).subscribe({
      next: offer => (this.offerTitle = offer?.title || 'Offer'),
      error: () => (this.offerTitle = 'Offer')
    });
  }

  // ✅ FILTER + SORT (includes SCORE)
  applyFilter(): void {
    let list = [...this.apps];

    if (this.statusFilter !== 'ALL') {
      list = list.filter(a => a.status === this.statusFilter);
    }

    if (this.sortMode === 'SCORE') {
      list.sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0));
    } else if (this.sortMode === 'NEWEST') {
      list.sort(
        (a, b) =>
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()
      );
    }

    this.filtered = list;
  }

  // ===============================
  // WORKFLOW
  // ===============================
  canShortlist(status: ApplicationStatus): boolean {
    return status === 'SENT';
  }

  canScheduleInterview(status: ApplicationStatus): boolean {
    return status === 'SENT' || status === 'SHORTLISTED';
  }

  canAccept(status: ApplicationStatus): boolean {
    return status === 'INTERVIEW';
  }

  canReject(status: ApplicationStatus): boolean {
    return (
      status === 'SENT' || status === 'SHORTLISTED' || status === 'INTERVIEW'
    );
  }

  shortlist(app: ApplicationResponse): void {
    this.updateStatus(app, 'SHORTLISTED');
  }
  reject(app: ApplicationResponse): void {
    this.updateStatus(app, 'REJECTED');
  }
  accept(app: ApplicationResponse): void {
    this.updateStatus(app, 'ACCEPTED');
  }

  private updateStatus(
    app: ApplicationResponse,
    status: ApplicationStatus
  ): void {
    this.applicationService.updateStatus(app.id, status).subscribe({
      next: () => {
        app.status = status;
        this.applyFilter();
      },
      error: () => alert('Error updating status.')
    });
  }

  // ===============================
  // INTERVIEW (keep as is)
  // ===============================
  openInterview(app: ApplicationResponse): void {
    this.interviewApp = app;
    this.interviewError = '';
    this.interviewSubmitting = false;

    this.meetLink = app.meetLink || '';
    this.interviewNote = app.interviewNote || '';
    this.interviewAtLocal = app.interviewAt
      ? this.toDatetimeLocal(app.interviewAt)
      : '';

    this.interviewOpen = true;
  }

  closeInterview(): void {
    this.interviewOpen = false;
    this.interviewSubmitting = false;
    this.interviewError = '';
    this.interviewApp = null;
    this.meetLink = '';
    this.interviewAtLocal = '';
    this.interviewNote = '';
  }

  submitInterview(): void {
    if (!this.interviewApp) return;

    this.interviewError = '';
    const meet = (this.meetLink || '').trim();
    const dtLocal = (this.interviewAtLocal || '').trim();

    if (!dtLocal) {
      this.interviewError = 'Interview date & time is required.';
      return;
    }
    if (!meet) {
      this.interviewError = 'Google Meet link is required.';
      return;
    }
    if (!this.isMeetUrl(meet)) {
      this.interviewError = 'Please enter a valid Google Meet URL.';
      return;
    }

    const payload: ScheduleInterviewRequest = {
      interviewAt: this.fromDatetimeLocalToIso(dtLocal),
      meetLink: meet,
      note: this.interviewNote?.trim() || undefined
    };

    this.interviewSubmitting = true;

    this.applicationService
      .scheduleInterview(this.interviewApp.id, payload)
      .subscribe({
        next: () => {
          this.interviewApp!.status = 'INTERVIEW';
          this.interviewApp!.meetLink = payload.meetLink;
          this.interviewApp!.interviewAt = payload.interviewAt;
          this.interviewApp!.interviewNote = payload.note || null;

          this.interviewSubmitting = false;
          this.applyFilter();
          this.closeInterview();
        },
        error: () => {
          this.interviewSubmitting = false;
          this.interviewError = 'Unable to schedule interview.';
        }
      });
  }

  private isMeetUrl(url: string): boolean {
    const u = url.toLowerCase();
    return (
      u.startsWith('https://meet.google.com/') ||
      u.startsWith('http://meet.google.com/')
    );
  }

  private toDatetimeLocal(iso: string): string {
    try {
      return iso.length >= 16 ? iso.substring(0, 16) : iso;
    } catch {
      return '';
    }
  }

  private fromDatetimeLocalToIso(dtLocal: string): string {
    return dtLocal.length === 16 ? `${dtLocal}:00` : dtLocal;
  }

  // ===============================
  // FILE PREVIEW
  // ===============================
  isValidUrl(url: string | null | undefined): boolean {
    return !!url && url.trim().length > 8;
  }

  isPdfUrl(value: string | null | undefined): boolean {
    if (!value) return false;
    const v = value.trim().toLowerCase();
    return v.endsWith('.pdf') || v.includes('/uploads/');
  }

  private toSafePdfUrl(rawUrl: string): SafeResourceUrl {
    const u = rawUrl.includes('#') ? rawUrl : rawUrl + '#toolbar=0';
    return this.sanitizer.bypassSecurityTrustResourceUrl(u);
  }

  openCv(url: string | null | undefined): void {
    if (!this.isValidUrl(url)) return;
    const raw = url!.trim();
    this.previewTitle = 'Candidate CV (PDF)';
    this.previewType = 'pdf';
    this.previewRawUrl = raw;
    this.previewUrl = this.toSafePdfUrl(raw);
    this.previewText = null;
    this.previewOpen = true;
  }

  openMotivation(motivation: string | null | undefined): void {
    if (!motivation || !motivation.trim()) {
      this.previewTitle = 'Motivation';
      this.previewType = 'text';
      this.previewText = 'No motivation provided.';
      this.previewRawUrl = null;
      this.previewUrl = null;
      this.previewOpen = true;
      return;
    }

    const val = motivation.trim();

    if (this.isPdfUrl(val) && this.isValidUrl(val)) {
      this.previewTitle = 'Motivation Letter (PDF)';
      this.previewType = 'pdf';
      this.previewRawUrl = val;
      this.previewUrl = this.toSafePdfUrl(val);
      this.previewText = null;
      this.previewOpen = true;
      return;
    }

    this.previewTitle = 'Motivation';
    this.previewType = 'text';
    this.previewText = val;
    this.previewRawUrl = null;
    this.previewUrl = null;
    this.previewOpen = true;
  }

  closePreview(): void {
    this.previewOpen = false;
    this.previewTitle = '';
    this.previewUrl = null;
    this.previewRawUrl = null;
    this.previewText = null;
  }

  openInNewTab(): void {
    if (!this.previewRawUrl) return;
    window.open(this.previewRawUrl, '_blank', 'noopener,noreferrer');
  }

  // ===============================
  // UI HELPERS
  // ===============================
  badgeClass(status: string): string {
    return (status || '').toLowerCase();
  }

  // ✅ SCORE HELPERS
  scoreClass(score: number | null | undefined): string {
    const s = Number(score ?? 0);
    if (s >= 80) return 'high';
    if (s >= 60) return 'mid';
    if (s >= 40) return 'low';
    return 'verylow';
  }

  // ✅ includes "Low"
  scoreLevel(score: number | null | undefined): string {
    const s = Number(score ?? 0);
    if (s >= 85) return 'Top';
    if (s >= 80) return 'High';
    if (s >= 60) return 'Medium';
    if (s >= 40) return 'Low';
    return 'Very Low';
  }

  scoreLabel(score: number | null | undefined): string {
    const s = Number(score ?? 0);
    if (s >= 85) return 'Top candidate (strong match)';
    if (s >= 80) return 'Excellent match';
    if (s >= 60) return 'Good match';
    if (s >= 40) return 'Average match';
    return 'Weak match';
  }

  isTopCandidate(score: number | null | undefined): boolean {
    return Number(score ?? 0) >= 85;
  }
}
