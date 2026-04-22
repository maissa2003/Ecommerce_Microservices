import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TrainerApplicationFoService } from '../../services/trainer-application-fo.service';
import { AuthService } from '../../../../modules/services/auth.service';

@Component({
  selector: 'app-trainer-apply',
  templateUrl: './trainer-apply.component.html',
  styleUrls: ['./trainer-apply.component.scss']
})
export class TrainerApplyComponent implements OnInit {
  userId: number | null = null;
  cvUrl = '';
  motivation = '';
  loading = false;
  successMsg = '';
  errorMsg = '';
  alreadyApplied = false;

  // ✅ Keywords techniques reconnues
  private techKeywords = [
    'java',
    'spring',
    'spring boot',
    'angular',
    'react',
    'vue',
    'node',
    'python',
    'django',
    'flask',
    'javascript',
    'typescript',
    'html',
    'css',
    'sql',
    'mysql',
    'postgresql',
    'mongodb',
    'docker',
    'kubernetes',
    'aws',
    'azure',
    'git',
    'linux',
    'microservices',
    'api',
    'rest',
    'graphql',
    'machine learning',
    'deep learning',
    'tensorflow',
    'devops',
    'ci/cd',
    'agile',
    'scrum',
    'flutter',
    'android',
    'ios',
    'swift',
    'kotlin'
  ];

  constructor(
    private appService: TrainerApplicationFoService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId();
    if (this.userId) {
      this.checkExistingApplication();
    }
  }

  private getUserIdFromLocalStorage(): number | null {
    return this.authService.getCurrentUserId();
  }

  checkExistingApplication(): void {
    if (!this.userId) return;
    this.appService.exists(this.userId).subscribe({
      next: status => {
        if (status === 'PENDING' || status === 'ACCEPTED') {
          this.alreadyApplied = true;
          this.router.navigate(['/trainer-portal/my-application']);
        } else {
          this.alreadyApplied = false;
        }
      },
      error: () => {
        this.alreadyApplied = false;
      }
    });
  }

  // ─── LIVE SCORE ───────────────────────────────────────

  // Score longueur (0-40 pts)
  get lengthScore(): number {
    const len = this.motivation?.trim().length || 0;
    if (len >= 300) return 40;
    if (len >= 200) return 30;
    if (len >= 100) return 20;
    if (len >= 50) return 10;
    return 0;
  }

  // Score mots-clés (0-40 pts)
  get keywordsScore(): number {
    const text = this.motivation?.toLowerCase() || '';
    const found = this.techKeywords.filter(k => text.includes(k));
    if (found.length >= 5) return 40;
    if (found.length >= 3) return 30;
    if (found.length >= 2) return 20;
    if (found.length >= 1) return 10;
    return 0;
  }

  // Score CV (0-20 pts)
  get cvScore(): number {
    return this.isCvValid ? 20 : 0;
  }

  // Score total (0-100)
  get totalScore(): number {
    return this.lengthScore + this.keywordsScore + this.cvScore;
  }

  get scoreLabel(): string {
    if (this.totalScore >= 80) return 'Excellent';
    if (this.totalScore >= 60) return 'Good';
    if (this.totalScore >= 40) return 'Average';
    return 'Weak';
  }

  get scoreClass(): string {
    if (this.totalScore >= 80) return 'score-excellent';
    if (this.totalScore >= 60) return 'score-good';
    if (this.totalScore >= 40) return 'score-average';
    return 'score-weak';
  }

  get detectedKeywords(): string[] {
    const text = this.motivation?.toLowerCase() || '';
    return this.techKeywords.filter(k => text.includes(k)).slice(0, 6);
  }

  get tips(): string[] {
    const tips: string[] = [];
    const len = this.motivation?.trim().length || 0;

    if (len < 50) tips.push('Write at least 50 characters to be considered.');
    if (len < 200)
      tips.push('Expand your motivation — aim for 200+ characters.');
    if (this.keywordsScore < 20)
      tips.push('Add technical keywords (Java, React, Spring...).');
    if (!this.isCvValid)
      tips.push('Add a valid CV link to strengthen your profile.');
    if (this.totalScore >= 80)
      tips.push('🎉 Great profile! You are ready to submit.');

    return tips;
  }

  // ─── FORM HELPERS ─────────────────────────────────────
  get isLoggedIn(): boolean {
    return this.userId !== null && this.userId > 0;
  }

  get isCvValid(): boolean {
    if (!this.cvUrl?.trim()) return false;
    try {
      const u = new URL(this.cvUrl.trim());
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  get isMotivationValid(): boolean {
    return (this.motivation?.trim().length ?? 0) >= 50;
  }

  get canSubmit(): boolean {
    return (
      this.isLoggedIn &&
      !this.alreadyApplied &&
      this.isCvValid &&
      this.isMotivationValid &&
      !this.loading
    );
  }

  submit(): void {
    this.successMsg = '';
    this.errorMsg = '';

    if (!this.isLoggedIn) {
      this.errorMsg = 'Not logged in.';
      return;
    }
    if (this.alreadyApplied) {
      this.errorMsg = '⚠️ You already submitted an application.';
      return;
    }
    if (!this.isCvValid || !this.isMotivationValid) {
      this.errorMsg = 'Check CV link and motivation (min 50 chars).';
      return;
    }

    this.loading = true;

    this.appService
      .submit({
        userId: Number(this.userId),
        cvUrl: this.cvUrl.trim(),
        motivation: this.motivation.trim()
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMsg = '✅ Application submitted successfully.';
          this.cvUrl = '';
          this.motivation = '';
          this.alreadyApplied = true;
          this.router.navigate(['/trainer-portal/my-application']);
        },
        error: (err: any) => {
          this.loading = false;
          const msg = (err?.error?.message || err?.error || '')
            .toString()
            .toLowerCase();
          if (msg.includes('already') || msg.includes('submitted')) {
            this.alreadyApplied = true;
            this.errorMsg = '⚠️ You already submitted an application.';
          } else {
            this.errorMsg = `❌ Error (${err?.status || '???'})`;
          }
        }
      });
  }
}
