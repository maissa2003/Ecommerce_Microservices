import { Component, OnInit } from '@angular/core';
import { TrainerDetailsService } from './services/trainer-details.service';

type HrPriority = 'LOW' | 'MEDIUM' | 'HIGH';

interface HrReview {
  appId: number;
  notes: string;
  tags: string[];
  priority: HrPriority;
  updatedAt: string; // ISO
  history: { at: string; text: string }[];
}

@Component({
  selector: 'app-trainer-details',
  templateUrl: './trainer-details.component.html',
  styleUrls: ['./trainer-details.component.scss']
})
export class TrainerDetailsComponent implements OnInit {
  details: any[] = [];
  search = '';

  // ---- Review modal state ----
  reviewOpen = false;
  activeRow: any | null = null;
  activeAppId: number | null = null;

  reviewNotes = '';
  reviewTagsInput = '';
  reviewPriority: HrPriority = 'MEDIUM';

  constructor(private service: TrainerDetailsService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.service.getAll().subscribe({
      next: data => (this.details = data || []),
      error: err => console.error(err)
    });
  }

  // Prefer application.id (your table shows it)
  private getAppId(row: any): number | null {
    const id = row?.application?.id;
    if (id && !isNaN(+id)) return +id;
    // fallback (rare)
    if (row?.id && !isNaN(+row.id)) return +row.id;
    return null;
  }

  // ---- Search ----
  get filteredDetails(): any[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.details;

    return this.details.filter(d => {
      const appId = String(d.application?.id ?? '');
      const level = String(d.level ?? '').toLowerCase();
      const skills = String(d.skills ?? '').toLowerCase();
      const summary = String(d.aiSummary ?? '').toLowerCase();

      const review = this.getReviewForRow(d);
      const tags = (review?.tags || []).join(' ').toLowerCase();
      const notes = String(review?.notes || '').toLowerCase();
      const prio = String(review?.priority || '').toLowerCase();

      return (
        appId.includes(q) ||
        level.includes(q) ||
        skills.includes(q) ||
        summary.includes(q) ||
        tags.includes(q) ||
        notes.includes(q) ||
        prio.includes(q)
      );
    });
  }

  splitSkills(skills: string): string[] {
    if (!skills) return [];
    return skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  delete(id: number) {
    if (!confirm('Delete this details?')) return;
    this.service.delete(id).subscribe(() => this.load());
  }

  // =========================
  // HR Review (localStorage)
  // =========================
  private reviewKey(appId: number): string {
    return `hr_review_${appId}`;
  }

  getReviewForRow(row: any): HrReview | null {
    const appId = this.getAppId(row);
    if (!appId) return null;

    const raw = localStorage.getItem(this.reviewKey(appId));
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return parsed as HrReview;
    } catch {
      return null;
    }
  }

  isReviewed(row: any): boolean {
    return !!this.getReviewForRow(row);
  }

  // Badge color by priority
  priorityClass(p?: HrPriority): string {
    if (p === 'HIGH') return 'prio-high';
    if (p === 'LOW') return 'prio-low';
    return 'prio-med';
  }

  openReview(row: any): void {
    this.activeRow = row;
    this.activeAppId = this.getAppId(row);

    if (!this.activeAppId) {
      alert('Cannot open review: missing applicationId');
      return;
    }

    const existing = this.getReviewForRow(row);

    if (existing) {
      this.reviewNotes = existing.notes || '';
      this.reviewPriority = (existing.priority || 'MEDIUM') as HrPriority;
      this.reviewTagsInput = (existing.tags || []).join(', ');
    } else {
      this.reviewNotes = '';
      this.reviewPriority = 'MEDIUM';
      this.reviewTagsInput = '';
      // Create first entry automatically on save
    }

    this.reviewOpen = true;
  }

  closeReview(): void {
    this.reviewOpen = false;
    this.activeRow = null;
    this.activeAppId = null;
  }

  private normalizeTags(input: string): string[] {
    if (!input) return [];
    return input
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .filter(
        (t, i, arr) =>
          arr.findIndex(x => x.toLowerCase() === t.toLowerCase()) === i
      )
      .slice(0, 12); // limit
  }

  saveReview(): void {
    if (!this.activeAppId) return;

    const now = new Date().toISOString();
    const tags = this.normalizeTags(this.reviewTagsInput);
    const notes = (this.reviewNotes || '').trim();

    const existingRaw = localStorage.getItem(this.reviewKey(this.activeAppId));
    let review: HrReview;

    if (existingRaw) {
      try {
        review = JSON.parse(existingRaw) as HrReview;
      } catch {
        review = {
          appId: this.activeAppId,
          notes: '',
          tags: [],
          priority: 'MEDIUM',
          updatedAt: now,
          history: []
        };
      }
    } else {
      review = {
        appId: this.activeAppId,
        notes: '',
        tags: [],
        priority: 'MEDIUM',
        updatedAt: now,
        history: []
      };
      review.history.push({ at: now, text: '📝 Review created' });
    }

    // History diff (simple)
    if ((review.priority || 'MEDIUM') !== this.reviewPriority) {
      review.history.push({
        at: now,
        text: `⭐ Priority set to ${this.reviewPriority}`
      });
    }
    if ((review.notes || '') !== notes) {
      review.history.push({ at: now, text: '✍️ Notes updated' });
    }
    const oldTags = (review.tags || []).join('|').toLowerCase();
    const newTags = tags.join('|').toLowerCase();
    if (oldTags !== newTags) {
      review.history.push({
        at: now,
        text: `🏷️ Tags updated (${tags.length})`
      });
    }

    review.notes = notes;
    review.tags = tags;
    review.priority = this.reviewPriority;
    review.updatedAt = now;

    localStorage.setItem(
      this.reviewKey(this.activeAppId),
      JSON.stringify(review)
    );
    this.closeReview();
  }

  clearReview(row: any): void {
    const appId = this.getAppId(row);
    if (!appId) return;
    if (!confirm(`Remove HR review for application #${appId}?`)) return;

    localStorage.removeItem(this.reviewKey(appId));
  }

  // For showing last history items in table
  lastHistory(row: any): { at: string; text: string }[] {
    const r = this.getReviewForRow(row);
    if (!r?.history?.length) return [];
    return [...r.history].slice(-3).reverse();
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }
}
