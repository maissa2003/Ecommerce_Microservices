import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-trainer-details',
  templateUrl: './trainer-details.component.html',
  styleUrls: ['./trainer-details.component.scss']
})
export class TrainerDetailsComponent implements OnInit {
  details: any[] = [];
  loading = false;
  error: string | null = null;
  selectedDetail: any = null;

  private baseUrl = 'http://localhost:8090/api/admin/trainer-details';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDetails();
  }

  loadDetails(): void {
    this.loading = true;
    this.error = null;

    this.http.get<any[]>(this.baseUrl).subscribe({
      next: data => {
        this.details = (data || []).map(d => ({
          id: d.id,
          applicationId: d.application?.id ?? '—',
          userId: d.application?.userId ?? '—',
          status: d.application?.status ?? 'Unknown',
          cvUrl: d.application?.cvUrl ?? null,
          motivation: d.application?.motivation ?? '—',
          submittedAt: d.application?.submittedAt ?? null,
          updatedAt: d.application?.updatedAt ?? null,
          level: d.level ?? '—',
          skills: this.parseSkills(d.skills),
          yearsExperience: d.yearsExperience ?? 0,
          aiSummary: d.aiSummary ?? null,
          generatedAt: d.generatedAt ?? null
        }));
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load trainer details.';
        this.loading = false;
        console.error('❌ Error loading trainer details:', err);
      }
    });
  }

  parseSkills(raw: any): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String);
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return raw
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    return [];
  }

  deleteDetail(id: number): void {
    if (!confirm('Are you sure you want to delete these trainer details?'))
      return;

    this.http.delete(`${this.baseUrl}/${id}`).subscribe({
      next: () => {
        this.details = this.details.filter(d => d.id !== id);
        if (this.selectedDetail?.id === id) this.selectedDetail = null;
      },
      error: err => {
        alert('Failed to delete trainer details');
        console.error('❌ Error deleting:', err);
      }
    });
  }

  viewDetail(detail: any): void {
    this.selectedDetail = detail;
  }

  closeModal(): void {
    this.selectedDetail = null;
  }

  trackById(_index: number, item: any): number {
    return item.id;
  }
}
