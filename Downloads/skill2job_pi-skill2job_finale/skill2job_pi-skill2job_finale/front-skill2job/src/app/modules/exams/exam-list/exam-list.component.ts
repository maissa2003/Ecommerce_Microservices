import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExamService } from '../../services/exam.service'; // ✅ Correct: ../../services/exam.service
import { Exam } from '../../models/exam'; // ✅ Correct: ../../models/exam
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-exam-list',
  templateUrl: './exam-list.component.html',
  styleUrls: ['./exam-list.component.scss']
})
export class ExamListComponent implements OnInit {
  exams: Exam[] = [];
  filteredExams: Exam[] = [];
  loading = true;
  error: string | null = null;
  takenExams: Map<number, { passed: boolean; score: number }> = new Map();

  activeFilter = 'all';
  searchQuery = '';
  userName: string = 'Mayssa';

  stats = {
    completedExams: 0,
    averageScore: 0,
    certificates: 0,
    pendingExams: 0
  };

  constructor(
    private examService: ExamService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.examService.getAllExams().subscribe({
      next: (data: Exam[]) => {
        console.log('Exams loaded:', data);
        this.exams = data;
        this.loadUserData();
      },
      error: (err: any) => {
        console.error('Error loading exams:', err);
        this.error = 'Failed to load exams. Please try again.';
        this.loading = false;
      }
    });
  }

  loadUserData(): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/signin']);
      return;
    }

    const userAny = user as any;
    let userId = userAny.id || userAny.userId;

    if (!userId) {
      console.warn(
        'No valid user ID found in auth data. Falling back to userId = 1.',
        user
      );
      userId = 1;
    }

    forkJoin({
      evaluations: this.examService.getUserEvaluations(userId),
      certificates: this.examService.getUserCertificates(userId)
    }).subscribe({
      next: ({ evaluations, certificates }) => {
        console.log('Evaluations loaded:', evaluations);
        console.log('Certificates loaded:', certificates);

        if (evaluations) {
          evaluations.forEach((evaluation: any) => {
            if (evaluation.examId) {
              this.takenExams.set(evaluation.examId, {
                passed: evaluation.passed || false,
                score: evaluation.score
              });
            }
          });
        }

        this.stats.certificates = certificates?.length || 0;
        this.stats.completedExams = this.takenExams.size;
        this.stats.pendingExams = this.exams.length - this.takenExams.size;

        const scores = Array.from(this.takenExams.values()).map(e => e.score);
        this.stats.averageScore = scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

        this.applyFilter();
        this.loading = false;
      },
      error: error => {
        console.error('Error loading user data:', error);
        this.loading = false;
      }
    });
  }

  filterExams(filter: string): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    let filtered = [...this.exams];

    if (this.searchQuery) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    switch (this.activeFilter) {
      case 'available':
        filtered = filtered.filter(exam => !this.takenExams.has(exam.id));
        break;
      case 'completed':
        filtered = filtered.filter(exam => this.takenExams.has(exam.id));
        break;
    }

    this.filteredExams = filtered;
  }

  onSearch(event: any): void {
    this.searchQuery = event.target.value;
    this.applyFilter();
  }

  getExamStatus(examId: number): string {
    const exam = this.takenExams.get(examId);
    if (!exam) return 'AVAILABLE';
    return exam.passed ? 'PASSED' : 'FAILED';
  }

  getStatusClass(examId: number): string {
    const exam = this.takenExams.get(examId);
    if (!exam) return 'available';
    return exam.passed ? 'completed' : 'failed';
  }

  getUserScore(examId: number): number | null {
    const exam = this.takenExams.get(examId);
    return exam ? exam.score : null;
  }

  isExamAvailable(examId: number): boolean {
    return !this.takenExams.has(examId);
  }

  hasQuestions(exam: Exam): boolean {
    return !!(exam.questions && exam.questions.length > 0);
  }

  getActionButtonText(examId: number): string {
    if (this.isExamAvailable(examId)) {
      return 'START EXAM';
    }
    return 'VIEW RESULTS';
  }

  handleExamAction(exam: Exam): void {
    if (this.isExamAvailable(exam.id)) {
      if (this.hasQuestions(exam)) {
        this.router.navigate(['/user/exams/take', exam.id]);
      } else {
        alert('This exam has no questions yet. Please check back later.');
      }
    } else {
      this.router.navigate(['/user/exams/result', exam.id]);
    }
  }

  goToCertificates(): void {
    this.router.navigate(['/user/certificates']);
  }
}
