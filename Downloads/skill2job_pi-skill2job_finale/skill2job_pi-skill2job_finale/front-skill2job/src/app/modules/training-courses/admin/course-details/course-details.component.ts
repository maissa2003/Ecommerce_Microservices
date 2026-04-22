import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TrainingCourseService } from '../../services/training-course.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit {
  course: any;
  pdfUrls: SafeResourceUrl[] = [];
  rawPdfUrls: string[] = [];
  loading = true;
  error: string | null = null;

  /** Index of the currently open accordion item (null = all closed) */
  openedIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: TrainingCourseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.service.getById(id).subscribe({
      next: (course: any) => {
        this.course = course;

        if (!this.course) {
          this.error = 'Course not found.';
          this.loading = false;
          return;
        }

        if (this.course.pdfUrls && this.course.pdfUrls.length > 0) {
          this.course.pdfUrls.forEach((pdf: string) => {
            // Build absolute URL pointing to Spring Boot /uploads/ folder
            const fullUrl = pdf.startsWith('http')
              ? pdf
              : environment.apiUrl.replace('/api', '') +
                (pdf.startsWith('/') ? '' : '/') +
                pdf;

            this.rawPdfUrls.push(fullUrl);
            this.pdfUrls.push(
              this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl)
            );
          });
        }

        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load course';
        this.loading = false;
      }
    });
  }

  /* ── Accordion ───────────────────────────────────── */
  toggleAccordion(index: number): void {
    this.openedIndex = this.openedIndex === index ? null : index;
  }

  /* ── Derive a human-readable title from the filename ── */
  getLessonTitle(index: number): string {
    const url = this.rawPdfUrls[index];
    if (!url) return `Document ${index + 1}`;
    try {
      const parts = url.split('/');
      const raw = decodeURIComponent(parts[parts.length - 1]);
      const noExt = raw.replace(/\.[^/.]+$/, '');
      const clean = noExt.replace(/[_\-]+/g, ' ').trim();
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    } catch {
      return `Document ${index + 1}`;
    }
  }

  /* ── Helpers ─────────────────────────────────────── */
  getRawUrl(index: number): string {
    return this.rawPdfUrls[index] ?? '';
  }

  getImageUrl(): string {
    if (!this.course?.imageUrl) return '/assets/placeholder.png';
    return this.course.imageUrl.startsWith('http')
      ? this.course.imageUrl
      : `${environment.apiUrl.replace('/api', '')}${this.course.imageUrl}`;
  }

  goBack(): void {
    this.router.navigate(['/admin/training-courses']);
  }
}
