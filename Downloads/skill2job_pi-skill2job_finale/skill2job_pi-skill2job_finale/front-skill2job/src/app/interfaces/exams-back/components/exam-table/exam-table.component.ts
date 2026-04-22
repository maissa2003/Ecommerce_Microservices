import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExamsService } from '../../services/exams.service';
import { Exam } from '../../models/exams.model';

@Component({
  selector: 'app-exam-table',
  templateUrl: './exam-table.component.html',
  styleUrls: ['./exam-table.component.scss']
})
export class ExamTableComponent implements OnInit {
  Math = Math;
  exams: Exam[] = [];
  filteredExams: Exam[] = [];
  loading = false;
  errorMessage = '';

  // Search
  searchQuery = '';

  // Pagination
  currentPage = 1;
  pageSize = 5;

  constructor(private examsService: ExamsService, private router: Router) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.examsService.getAllExams().subscribe({
      next: data => {
        this.exams = data;
        this.filteredExams = data;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading exams:', error);
        this.errorMessage =
          'Failed to load exams. Make sure the backend is running.';
        this.loading = false;
      }
    });
  }

  // ─── Search ───────────────────────────────────────────────────────────────

  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredExams = q
      ? this.exams.filter(
          e =>
            e.title.toLowerCase().includes(q) ||
            e.description?.toLowerCase().includes(q)
        )
      : [...this.exams];
    this.currentPage = 1;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredExams = [...this.exams];
    this.currentPage = 1;
  }

  // ─── Pagination ───────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.ceil(this.filteredExams.length / this.pageSize);
  }

  get pagedExams(): Exam[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredExams.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  addExam(): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    setTimeout(() => this.router.navigate(['/admin/exams/exam-form']), 100);
  }

  editExam(id: number): void {
    this.router.navigate(['/admin/exams/exam-form', id]);
  }

  deleteExam(id: number): void {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.examsService.deleteExam(id).subscribe({
        next: () => this.loadExams(),
        error: () => alert('Failed to delete exam')
      });
    }
  }

  viewEvaluations(examId: number): void {
    this.router.navigate(['/admin/exams/evaluation-table', examId]);
  }

  manageQuestions(examId: number): void {
    this.router.navigate(['/admin/exams/question-form', examId]);
  }
}
