import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingCourseService } from '../../services/training-course.service';
import { PaymentService } from '../../payment/services/payment.service';
import {
  CourseProgressService,
  CourseProgress
} from '../../course-progress/services/course-progress.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-enrolled-course',
  templateUrl: './enrolled-course.component.html',
  styleUrls: ['./enrolled-course.component.scss']
})
export class EnrolledCourseComponent implements OnInit {
  courseId: number = 0;
  course: any = null;
  progress: CourseProgress | null = null;

  hasAccess: boolean = false;
  isLoading: boolean = true;
  errorMessage: string = '';

  lessons: PdfLesson[] = [];
  currentLessonIndex: number = 0;

  /** lessonIndex → Set of pdf indices that are checked */
  checkedPdfs: Map<number, Set<number>> = new Map();

  showCompletionBanner = false;
  pointsAwarded = 50;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: TrainingCourseService,
    private paymentService: PaymentService,
    private progressService: CourseProgressService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.courseId = +params['id'];
      this.checkAccessAndLoad();
    });
  }

  // ── Access check ──────────────────────────────────────────────

  checkAccessAndLoad(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/signin']);
      return;
    }
    this.isLoading = true;

    this.paymentService.checkAccess(this.courseId).subscribe({
      next: (result: any) => {
        this.hasAccess = result.hasAccess || false;
        if (!this.hasAccess) {
          this.errorMessage = 'You need to purchase this course first';
          this.isLoading = false;
          return;
        }
        // ✅ Load course FIRST, then progress
        this.loadCourseFirst();
      },
      error: () => {
        this.hasAccess = false;
        this.errorMessage = 'Error checking access';
        this.isLoading = false;
      }
    });
  }

  // ── Load course → build lessons → THEN load progress ──────────
  // This order guarantees this.lessons.length is correct before
  // startCourse() is called (fixing the 10% bug).

  loadCourseFirst(): void {
    this.courseService.getAll().subscribe({
      next: (courses: any[]) => {
        this.course = courses.find(c => c.id === this.courseId);

        if (!this.course) {
          this.errorMessage = 'Course not found';
          this.isLoading = false;
          return;
        }

        // ✅ Build lessons from PDFs BEFORE touching progress
        this.buildLessonsFromPdfs();

        // ✅ Now safe to load/start progress with correct total
        this.loadProgress();

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error loading course';
        this.isLoading = false;
      }
    });
  }

  // ── Build lessons from PDFs ────────────────────────────────────

  buildLessonsFromPdfs(): void {
    const pdfs: string[] = this.course?.pdfUrls || [];

    this.lessons =
      pdfs.length > 0
        ? pdfs.map((url, i) => ({
            index: i,
            title: `Lesson ${i + 1}: ${this.getPdfDisplayName(url)}`,
            pdfUrl: url,
            pdfName: this.getPdfDisplayName(url),
            completed: false,
            opened: false
          }))
        : [
            {
              index: 0,
              title: 'Course Overview',
              pdfUrl: null,
              pdfName: null,
              completed: false,
              opened: false
            }
          ];

    // Init checkbox state per lesson
    this.lessons.forEach((_, i) => this.checkedPdfs.set(i, new Set()));
  }

  getPdfDisplayName(url: string): string {
    const raw = url.split('/').pop() || 'document.pdf';
    return raw.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
  }

  // ── Progress: load or start ────────────────────────────────────

  loadProgress(): void {
    this.progressService.getProgress(this.courseId).subscribe({
      next: (result: any) => {
        if (result && result.id) {
          this.progress = result as CourseProgress;

          // ✅ If backend totalLessons is wrong (old record), patch it
          const actualTotal = this.lessons.length;
          if (
            this.progress &&
            (this.progress as any).totalLessons !== actualTotal
          ) {
            // Re-start with correct total to fix stale records
            this.restartWithCorrectTotal(actualTotal);
            return;
          }

          const completed = this.progress?.completedLessons || 0;
          this.lessons.forEach((l, i) => {
            if (i < completed) l.completed = true;
          });
          this.currentLessonIndex = Math.min(
            completed,
            this.lessons.length - 1
          );
        } else {
          this.startCourse();
        }
      },
      error: () => {
        this.startCourse();
      }
    });
  }

  /** Called when existing progress has wrong totalLessons */
  restartWithCorrectTotal(total: number): void {
    this.progressService.startCourse(this.courseId, total).subscribe({
      next: (p: CourseProgress) => {
        this.progress = p;
        this.currentLessonIndex = 0;
        this.lessons.forEach(l => (l.completed = false));
      },
      error: (err: any) => console.error('Error restarting course:', err)
    });
  }

  startCourse(): void {
    // ✅ Use ACTUAL lesson count — lessons are already built at this point
    const total = this.lessons.length || 1;

    this.progressService.startCourse(this.courseId, total).subscribe({
      next: (p: CourseProgress) => {
        this.progress = p;
        this.currentLessonIndex = 0;
      },
      error: (err: any) => console.error('Error starting course:', err)
    });
  }

  // ── Lesson navigation ─────────────────────────────────────────

  selectLesson(index: number): void {
    const maxAllowed = this.progress?.completedLessons ?? 0;
    if (index > maxAllowed) return;
    this.currentLessonIndex = index;
  }

  isLessonLocked(index: number): boolean {
    return index > (this.progress?.completedLessons ?? 0);
  }
  isLessonCompleted(index: number): boolean {
    return index < (this.progress?.completedLessons ?? 0);
  }
  isLessonActive(index: number): boolean {
    return index === this.currentLessonIndex;
  }
  getCurrentLesson(): PdfLesson | null {
    return this.lessons[this.currentLessonIndex] || null;
  }

  // ── PDF interaction ────────────────────────────────────────────

  openPdf(lesson: PdfLesson): void {
    if (!lesson.pdfUrl) return;
    const url = lesson.pdfUrl.startsWith('http')
      ? lesson.pdfUrl
      : environment.apiUrl.replace('/api', '') + lesson.pdfUrl;
    window.open(url, '_blank');
    lesson.opened = true;
  }

  togglePdfChecked(lessonIndex: number, pdfIndex: number): void {
    const set = this.checkedPdfs.get(lessonIndex) || new Set<number>();
    set.has(pdfIndex) ? set.delete(pdfIndex) : set.add(pdfIndex);
    this.checkedPdfs.set(lessonIndex, set);
    this.checkAutoComplete(lessonIndex);
  }

  isPdfChecked(lessonIndex: number, pdfIndex: number): boolean {
    return this.checkedPdfs.get(lessonIndex)?.has(pdfIndex) ?? false;
  }

  getTotalPdfsInLesson(lessonIndex: number): number {
    return this.lessons[lessonIndex]?.pdfUrl ? 1 : 0;
  }

  getCheckedCountInLesson(lessonIndex: number): number {
    return this.checkedPdfs.get(lessonIndex)?.size ?? 0;
  }

  allPdfsChecked(lessonIndex: number): boolean {
    const total = this.getTotalPdfsInLesson(lessonIndex);
    const checked = this.getCheckedCountInLesson(lessonIndex);
    return total > 0 && checked >= total;
  }

  // ── Auto-complete ─────────────────────────────────────────────

  checkAutoComplete(lessonIndex: number): void {
    if (!this.allPdfsChecked(lessonIndex)) return;
    if (this.isLessonCompleted(lessonIndex)) return;
    if (lessonIndex !== (this.progress?.completedLessons ?? 0)) return;
    this.completeLesson();
  }

  completeLesson(): void {
    if (!this.progress) return;
    const lessonNumber = this.currentLessonIndex + 1;

    this.progressService.updateProgress(this.courseId, lessonNumber).subscribe({
      next: (updated: CourseProgress) => {
        this.progress = updated;
        this.lessons[this.currentLessonIndex].completed = true;

        if (updated.isCompleted) {
          this.showCompletionBanner = true;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (this.currentLessonIndex < this.lessons.length - 1) {
          setTimeout(() => {
            this.currentLessonIndex++;
          }, 600);
        }
      },
      error: (err: any) => console.error('Error completing lesson:', err)
    });
  }

  manualCompleteLesson(): void {
    const idx = this.currentLessonIndex;
    if (this.isLessonCompleted(idx) || this.isLessonLocked(idx)) return;
    this.completeLesson();
  }

  // ── Progress % ────────────────────────────────────────────────
  // ✅ Calculate locally so it's always correct regardless of backend rounding

  getProgressPercentage(): number {
    const total = this.lessons.length;
    const completed = this.progress?.completedLessons ?? 0;
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  }

  // ── Helpers ───────────────────────────────────────────────────

  goBack(): void {
    this.router.navigate(['/user/courses']);
  }

  downloadPdf(pdfUrl: string): void {
    const url = pdfUrl.startsWith('http')
      ? pdfUrl
      : environment.apiUrl.replace('/api', '') + pdfUrl;
    window.open(url, '_blank');
  }
}

export interface PdfLesson {
  index: number;
  title: string;
  pdfUrl: string | null;
  pdfName: string | null;
  completed: boolean;
  opened: boolean;
}
