import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import {
  Exam,
  Evaluation,
  Certificate,
  ExamSubmission
} from '../../models/exam';

@Component({
  selector: 'app-exam-result',
  templateUrl: './exam-result.component.html',
  styleUrls: ['./exam-result.component.scss']
})
export class ExamResultComponent implements OnInit {
  exam: Exam | null = null;
  evaluation: Evaluation | null = null;
  certificate: Certificate | null = null;
  submission: ExamSubmission | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const examId = Number(this.route.snapshot.paramMap.get('id'));

    // Try router state first, fall back to sessionStorage
    const state = history.state as { submission?: ExamSubmission };
    if (state?.submission) {
      this.submission = state.submission;
    } else {
      const stored = sessionStorage.getItem(`exam_submission_${examId}`);
      if (stored) {
        this.submission = JSON.parse(stored);
      }
    }

    if (examId) {
      this.loadResults(examId);
    } else {
      this.router.navigate(['/user/exams']);
    }
  }

  loadResults(examId: number): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();
    const userAny = user as any;
    const userId = userAny?.id ?? userAny?.userId ?? 1;

    this.examService.getExamById(examId).subscribe({
      next: (exam: Exam) => {
        this.exam = exam;

        this.examService.getUserEvaluations(userId).subscribe({
          next: (evaluations: Evaluation[]) => {
            const evaluation = evaluations.find(e => e.examId === examId);
            if (evaluation) {
              this.evaluation = evaluation;
              if (evaluation.passed) {
                this.checkCertificate(examId, userId);
              }
            }
            this.loading = false;
          },
          error: (err: any) => {
            console.error('Error loading evaluation:', err);
            this.error = 'Failed to load results';
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        console.error('Error loading exam:', err);
        this.error = 'Failed to load exam details';
        this.loading = false;
      }
    });
  }

  checkCertificate(examId: number, userId: number): void {
    this.examService.getUserCertificates(userId).subscribe({
      next: (certificates: Certificate[]) => {
        const cert = certificates.find(c => c.examId === examId);
        if (cert) this.certificate = cert;
      },
      error: (err: any) => console.error('Error checking certificate:', err)
    });
  }

  downloadCertificate(): void {
    if (this.certificate) {
      alert(
        `Certificate Code: ${this.certificate.certificateCode}\nIssue Date: ${this.certificate.issueDate}`
      );
    }
  }

  retakeExam(): void {
    this.router.navigate(['/user/exams/take', this.exam?.id]);
  }

  goToExams(): void {
    this.router.navigate(['/user/exams']);
  }

  viewQuestionDetails(): void {
    if (!this.exam) return;
    this.router.navigate(['/user/exams/detail', this.exam.id], {
      state: { submission: this.submission ?? undefined }
    });
  }
}
