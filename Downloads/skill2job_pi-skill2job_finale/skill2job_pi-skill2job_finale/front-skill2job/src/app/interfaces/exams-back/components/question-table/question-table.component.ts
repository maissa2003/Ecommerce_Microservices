import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamsService } from '../../services/exams.service';
import { Exam, Question } from '../../models/exams.model';

@Component({
  selector: 'app-question-table',
  templateUrl: './question-table.component.html',
  styleUrls: ['./question-table.component.scss']
})
export class QuestionTableComponent implements OnInit {
  exams: Exam[] = [];
  selectedExamId: number | null = null;
  questions: Question[] = [];
  loading = false;
  errorMessage = '';
  deletingId: number | null = null;

  constructor(
    private examsService: ExamsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const examId = this.route.snapshot.params['examId'];
    if (examId) {
      this.selectedExamId = Number(examId);
    }
    this.loadExams();
    if (this.selectedExamId) {
      this.loadQuestions();
    }
  }

  get selectedExam(): Exam | null {
    return this.exams.find(e => e.id === this.selectedExamId) ?? null;
  }

  loadExams(): void {
    this.examsService.getAllExams().subscribe({
      next: data => {
        this.exams = data;
        if (!this.selectedExamId && data.length) {
          this.selectedExamId = data[0].id ?? null;
          this.loadQuestions();
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load exams.';
      }
    });
  }

  onExamChange(): void {
    this.questions = [];
    this.errorMessage = '';
    if (this.selectedExamId) {
      this.loadQuestions();
      this.router.navigate(
        ['/admin/exams/question-table', this.selectedExamId],
        { replaceUrl: true }
      );
    } else {
      this.router.navigate(['/admin/exams/question-table'], {
        replaceUrl: true
      });
    }
  }

  loadQuestions(): void {
    if (!this.selectedExamId) return;
    this.loading = true;
    this.errorMessage = '';
    this.examsService.getQuestionsByExam(this.selectedExamId).subscribe({
      next: data => {
        this.questions = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load questions.';
        this.loading = false;
      }
    });
  }

  addQuestion(): void {
    if (!this.selectedExamId) return;
    this.router.navigate(['/admin/exams/question-form', this.selectedExamId]);
  }

  editQuestion(question: Question): void {
    if (question.id) {
      this.router.navigate(['/admin/exams/question-form/edit', question.id]);
    }
  }

  deleteQuestion(question: Question): void {
    if (!question.id) return;
    if (!confirm('Are you sure you want to delete this question?')) return;
    this.deletingId = question.id;
    this.examsService.deleteQuestion(question.id).subscribe({
      next: () => {
        this.questions = this.questions.filter(q => q.id !== question.id);
        this.deletingId = null;
      },
      error: () => {
        alert('Failed to delete question.');
        this.deletingId = null;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/exams']);
  }

  getOptionLabel(key: string): string {
    const map: Record<string, string> = {
      A: 'A',
      B: 'B',
      C: 'C',
      D: 'D'
    };
    return map[key] || key;
  }

  truncate(text: string, max: number): string {
    if (!text) return '';
    return text.length <= max ? text : text.slice(0, max) + '...';
  }
}
