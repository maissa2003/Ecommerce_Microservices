import { Component, OnInit, Inject } from '@angular/core';
import { TrainerProfileService } from '../../services/trainer-profile.service';
import { AuthService } from '../../../../modules/services/auth.service';

type ProfileDraft = {
  headline: string;
  bio: string;
  location: string;
  languages: string; // comma-separated
  expertise: string; // comma-separated
  tools: string; // comma-separated
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  availability: 'Full-time' | 'Part-time' | 'Weekends' | 'Flexible';
  hourlyRate: string;
};

@Component({
  selector: 'app-trainer-my-profile',
  templateUrl: './trainer-my-profile.component.html',
  styleUrls: ['./trainer-my-profile.component.scss']
})
export class TrainerMyProfileComponent implements OnInit {
  loading = false;
  errorMsg = '';
  profile: any | null = null;

  userId: number | null = null;

  // UI state
  editing = false;
  savedMsg = '';

  // Local “professional profile” fields (no backend needed)
  draft: ProfileDraft = this.defaultDraft();

  constructor(
    private profileService: TrainerProfileService,
    private authService: AuthService // ← add this
  ) {}
  ngOnInit(): void {
    this.userId = this.getUserIdFromLocalStorage();

    if (!this.userId) {
      this.errorMsg = 'Not logged in. Please sign in.';
      return;
    }

    this.load();
    this.loadDraft();
  }

  private getUserIdFromLocalStorage(): number | null {
    return this.authService.getCurrentUserId(); // ✅ single source of truth
  }

  load(): void {
    if (!this.userId) return;

    this.loading = true;
    this.errorMsg = '';
    this.profile = null;

    this.profileService.getMine(this.userId).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.profile = data;

        // OPTIONAL: auto-fill some draft fields once when empty
        if (!this.draft.headline?.trim()) {
          this.draft.headline = data?.mainSpeciality
            ? `${data.mainSpeciality} Trainer`
            : 'Professional Trainer';
        }
        this.persistDraft(); // keep synced
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = '';

        if (err?.status === 404) {
          this.errorMsg =
            'Your trainer profile is not available yet. Wait for HR approval.';
          return;
        }

        this.errorMsg = `Error (${err?.status || '???'}) : ${err?.error
          ?.message || 'Unable to load profile'}`;
      }
    });
  }

  // --------- “Real profile” fields (localStorage) ----------
  private storageKey(): string {
    return `trainer_profile_draft_${this.userId || 'guest'}`;
  }

  private defaultDraft(): ProfileDraft {
    return {
      headline: '',
      bio: '',
      location: '',
      languages: 'English, French',
      expertise: '',
      tools: '',
      portfolioUrl: '',
      linkedinUrl: '',
      githubUrl: '',
      availability: 'Flexible',
      hourlyRate: ''
    };
  }

  loadDraft(): void {
    const raw = localStorage.getItem(this.storageKey());
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      this.draft = { ...this.defaultDraft(), ...obj };
    } catch {}
  }

  persistDraft(): void {
    localStorage.setItem(this.storageKey(), JSON.stringify(this.draft));
  }

  toggleEdit(): void {
    this.savedMsg = '';
    this.editing = !this.editing;
    if (!this.editing) this.loadDraft(); // revert if cancelled
  }

  saveDraft(): void {
    this.persistDraft();
    this.savedMsg = '✅ Saved locally.';
    this.editing = false;
    setTimeout(() => (this.savedMsg = ''), 2000);
  }

  // --------- helpers ----------
  get initials(): string {
    const id = this.userId || 0;
    return `T${id}`;
  }

  get statusLabel(): string {
    return (this.profile?.status || 'PENDING').toUpperCase();
  }

  get levelLabel(): string {
    return (this.profile?.level || 'JUNIOR').toUpperCase();
  }

  get statusClass(): string {
    const s = this.statusLabel;
    if (s === 'ACTIVE') return 'st-active';
    if (s === 'SUSPENDED') return 'st-suspended';
    return 'st-pending';
  }

  get levelClass(): string {
    const l = this.levelLabel;
    if (l === 'SENIOR') return 'lv-senior';
    if (l === 'MID') return 'lv-mid';
    return 'lv-junior';
  }

  toList(text: string): string[] {
    return (text || '')
      .split(/[,\n;|]/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  get expertiseList(): string[] {
    return this.toList(this.draft.expertise);
  }
  get toolsList(): string[] {
    return this.toList(this.draft.tools);
  }
  get languagesList(): string[] {
    return this.toList(this.draft.languages);
  }

  // profile completeness score (nice professional touch)
  get completeness(): number {
    const checks = [
      !!this.draft.headline.trim(),
      !!this.draft.bio.trim(),
      !!this.draft.location.trim(),
      this.languagesList.length > 0,
      this.expertiseList.length > 0,
      !!this.draft.portfolioUrl.trim()
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }

  get completenessLabel(): string {
    const c = this.completeness;
    if (c >= 85) return 'Excellent';
    if (c >= 60) return 'Good';
    return 'Needs work';
  }

  downloadProfile(): void {
    const lines = [
      '═══════════════════════════════════',
      '        TRAINER PROFILE — Skill2Job',
      '═══════════════════════════════════',
      `Trainer ID    : ${this.userId}`,
      `Headline      : ${this.draft.headline || '-'}`,
      `Speciality    : ${this.profile?.mainSpeciality || '-'}`,
      `Level         : ${this.levelLabel}`,
      `Status        : ${this.statusLabel}`,
      `Location      : ${this.draft.location || '-'}`,
      `Availability  : ${this.draft.availability}`,
      `Rate          : ${this.draft.hourlyRate || '-'}`,
      `Languages     : ${this.languagesList.join(', ') || '-'}`,
      `Expertise     : ${this.expertiseList.join(', ') || '-'}`,
      `Tools         : ${this.toolsList.join(', ') || '-'}`,
      `Portfolio     : ${this.draft.portfolioUrl || '-'}`,
      `LinkedIn      : ${this.draft.linkedinUrl || '-'}`,
      `GitHub        : ${this.draft.githubUrl || '-'}`,
      '═══════════════════════════════════',
      'Generated by Skill2Job Platform'
    ];

    const blob = new Blob([lines.join('\n')], {
      type: 'text/plain;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trainer-profile-${this.userId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
