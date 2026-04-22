import { Component, OnInit } from '@angular/core';
import { TrainerProfileService } from './services/trainer-profile.service';
import { HttpClient } from '@angular/common/http';

type ProfileStatus = 'ACTIVE' | 'SUSPENDED';
type Level = 'JUNIOR' | 'MID' | 'SENIOR' | string;

@Component({
  selector: 'app-trainer-profiles',
  templateUrl: './trainer-profiles.component.html',
  styleUrls: ['./trainer-profiles.component.scss']
})
export class TrainerProfilesComponent implements OnInit {
  profiles: any[] = [];
  filteredProfiles: any[] = [];

  loading = false;
  search = '';
  selectedStatus: '' | ProfileStatus = '';
  selectedLevel: '' | Level = '';

  selectedProfile: any | null = null;
  selectedDetails: any | null = null; // ✅ AI details
  loadingDetails = false;
  isModalOpen = false;

  constructor(
    private service: TrainerProfileService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: data => {
        this.profiles = data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        alert('Error loading trainer profiles');
      }
    });
  }

  applyFilters() {
    const q = (this.search || '').toLowerCase().trim();
    this.filteredProfiles = (this.profiles || []).filter(p => {
      const matchesSearch =
        !q ||
        String(p?.id ?? '').includes(q) ||
        String(p?.userId ?? '').includes(q) ||
        String(p?.mainSpeciality ?? '')
          .toLowerCase()
          .includes(q) ||
        String(p?.level ?? '')
          .toLowerCase()
          .includes(q) ||
        String(p?.status ?? '')
          .toLowerCase()
          .includes(q);
      const matchesStatus =
        !this.selectedStatus || p?.status === this.selectedStatus;
      const matchesLevel =
        !this.selectedLevel || p?.level === this.selectedLevel;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }

  get totalCount(): number {
    return this.profiles?.length || 0;
  }
  get activeCount(): number {
    return (this.profiles || []).filter(p => p?.status === 'ACTIVE').length;
  }
  get suspendedCount(): number {
    return (this.profiles || []).filter(p => p?.status === 'SUSPENDED').length;
  }

  changeStatus(id: number, status: ProfileStatus) {
    this.service.changeStatus(id, status).subscribe({
      next: () => this.load(),
      error: (err: any) => {
        console.error(err);
        alert('Error updating status');
      }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this profile?')) return;
    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: (err: any) => {
        console.error(err);
        alert('Error deleting profile');
      }
    });
  }

  // ✅ Open modal + load AI details
  openProfile(p: any) {
    this.selectedProfile = p;
    this.selectedDetails = null;
    this.isModalOpen = true;

    if (p?.applicationId) {
      this.loadDetails(p.applicationId);
    } else {
      // fallback: cherche via userId dans les applications
      this.loadDetailsByUserId(p.userId);
    }
  }

  loadDetails(applicationId: number) {
    this.loadingDetails = true;
    this.http
      .get(
        `http://localhost:8090/api/admin/trainer-details/by-application/${applicationId}`
      )
      .subscribe({
        next: data => {
          this.selectedDetails = data;
          this.loadingDetails = false;
        },
        error: () => {
          this.selectedDetails = null;
          this.loadingDetails = false;
        }
      });
  }

  loadDetailsByUserId(userId: number) {
    this.loadingDetails = true;
    this.http
      .get<any[]>(`http://localhost:8090/api/admin/trainer-details`)
      .subscribe({
        next: data => {
          // trouve le detail dont l'application correspond au userId
          const found = (data || []).find(
            d => d?.application?.userId === userId
          );
          this.selectedDetails = found || null;
          this.loadingDetails = false;
        },
        error: () => {
          this.selectedDetails = null;
          this.loadingDetails = false;
        }
      });
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedProfile = null;
    this.selectedDetails = null;
  }

  // ✅ Helpers AI
  extractConfidence(): number {
    if (!this.selectedDetails?.aiSummary) return 0;
    const match = this.selectedDetails.aiSummary.match(/Confidence.*?(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  get scoreColor(): string {
    const c = this.extractConfidence();
    if (c >= 80) return 'score-high';
    if (c >= 60) return 'score-mid';
    return 'score-low';
  }

  get skillsList(): string[] {
    if (!this.selectedDetails?.skills) return [];
    return this.selectedDetails.skills
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  get recommendation(): string {
    const c = this.extractConfidence();
    if (c >= 80) return '🟢 Highly recommended. Strong trainer candidate.';
    if (c >= 60) return '🟡 Recommended. Proceed with onboarding.';
    return '🟠 Conditionally recommended. Junior track with supervision.';
  }
}
