import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ExamsService } from '../../services/exams.service';

@Component({
  selector: 'app-evaluation-table',
  templateUrl: './evaluation-table.component.html',
  styleUrls: ['./evaluation-table.component.scss']
})
export class EvaluationTableComponent implements OnInit {
  evaluations: any[] = [];
  examId: number | null = null;
  loading = false;
  errorMessage = '';
  userNames: Map<number, string> = new Map();

  private apiBase = 'http://localhost:8090';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examsService: ExamsService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.examId = this.route.snapshot.params['examId']
      ? +this.route.snapshot.params['examId']
      : null;
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.loading = true;
    this.errorMessage = '';

    const request = this.examId
      ? this.examsService.getEvaluationsByExam(this.examId)
      : this.examsService.getAllEvaluations();

    request.subscribe({
      next: data => {
        this.evaluations = data;
        this.loading = false;
        // Load usernames for all unique userIds
        const ids = [
          ...new Set(data.map((e: any) => e.userId).filter(Boolean))
        ];
        this.loadUserNames(ids as number[]);
      },
      error: error => {
        if (error.status === 0) {
          this.errorMessage =
            'Cannot connect to backend. Is the server running?';
        } else if (error.status === 404) {
          this.errorMessage = 'API endpoint not found.';
        } else if (error.status === 500) {
          this.errorMessage = 'Server error. Check backend console.';
        } else {
          this.errorMessage = `Failed to load evaluations: ${error.message ||
            'Unknown error'}`;
        }
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

  generateCertificate(evaluationId: number): void {
    this.examsService.generateCertificate(evaluationId).subscribe({
      next: () => this.loadEvaluations(),
      error: () =>
        alert('Failed to generate certificate. It may already exist.')
    });
  }

  deleteEvaluation(id: number): void {
    if (confirm('Are you sure you want to delete this evaluation?')) {
      this.examsService.deleteEvaluation(id).subscribe({
        next: () => this.loadEvaluations(),
        error: () => alert('Failed to delete evaluation.')
      });
    }
  }

  viewCertificate(evaluationId: number): void {
    this.examsService.getCertificateByEvaluation(evaluationId).subscribe({
      next: cert => {
        if (cert) {
          this.router.navigate(['/admin/exams/certificates', cert.id]);
        } else {
          alert('No certificate found for this evaluation.');
        }
      },
      error: () => alert('No certificate found for this evaluation.')
    });
  }

  refresh(): void {
    this.loadEvaluations();
  }
}
