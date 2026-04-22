import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainingCourseService } from '../../services/training-course.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.css']
})
export class CourseManagementComponent implements OnInit {
  courses: any[] = [];
  newCourse: any = { category: { id: null, name: '' } };
  editingId: number | null = null;
  showForm = false;
  formMode: 'add' | 'edit' = 'add';
  selectedImage?: File | null = null;
  selectedPdf?: File | null = null;
  imagePreview: string | null = null;
  environment = environment;

  constructor(
    private service: TrainingCourseService,
    private http: HttpClient,
    private router: Router
  ) {}
  goToCourse(id: number) {
    this.router.navigate(['/admin/courses', id]);
  }

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.service.getAll().subscribe(data => {
      this.courses = (data || []).map((c: any) => {
        // normalize image/pdf URLs to backend origin when they are relative
        try {
          if (c.imageUrl && !/^https?:\/\//i.test(c.imageUrl)) {
            c.imageUrl = c.imageUrl.startsWith('/')
              ? environment.apiUrl.replace('/api', '') + c.imageUrl
              : environment.apiUrl.replace('/api', '') + '/' + c.imageUrl;
          }
          if (c.pdfUrl && !/^https?:\/\//i.test(c.pdfUrl)) {
            c.pdfUrl = c.pdfUrl.startsWith('/')
              ? environment.apiUrl.replace('/api', '') + c.pdfUrl
              : environment.apiUrl.replace('/api', '') + '/' + c.pdfUrl;
          }
        } catch (e) {
          // ignore and return as-is
        }
        return c;
      });
    });
  }

  addCourse() {
    const fd = new FormData();
    fd.append('title', this.newCourse.title || '');
    fd.append('description', this.newCourse.description || '');
    fd.append('categoryName', this.newCourse.category?.name || '');

    if (this.selectedImage)
      fd.append('image', this.selectedImage, this.selectedImage.name);
    if (this.selectedPdf)
      fd.append('pdf', this.selectedPdf, this.selectedPdf.name);

    if (this.editingId) {
      this.service.update(this.editingId, fd).subscribe({
        next: () => this.afterSave(),
        error: err => alert('Update failed: ' + err.message)
      });
    } else {
      this.service.create(fd).subscribe({
        next: () => this.afterSave(),
        error: err => alert('Create failed: ' + err.message)
      });
    }
  }

  afterSave() {
    this.loadCourses();
    this.newCourse = { category: { name: '' } };
    this.showForm = false;
    this.clearFiles();
  }

  editCourse(course: any) {
    this.editingId = course.id;
    this.newCourse = { ...course };
    if (!this.newCourse.category) {
      this.newCourse.category = { name: '' };
    } else if (!this.newCourse.category.name) {
      this.newCourse.category.name = this.newCourse.category.name ?? '';
    }
    this.formMode = 'edit';
    this.showForm = true;
    this.imagePreview = course.imageUrl ?? null;
  }

  cancelEdit() {
    this.editingId = null;
    this.newCourse = { category: { name: '' } };
    this.showForm = false;
    this.clearFiles();
  }

  deleteCourse(id: number) {
    if (!confirm('Delete this course?')) return;
    this.service.delete(id).subscribe({
      next: () => this.loadCourses(),
      error: err => {
        console.error('Delete failed', err);
        alert('Delete failed: ' + (err?.message || err));
      }
    });
  }

  openAddForm() {
    this.formMode = 'add';
    this.showForm = true;
    this.newCourse = { category: { name: '' } };
    this.clearFiles();
  }

  onImageSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(this.selectedImage);
    }
  }

  onPdfSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (input.files?.length) this.selectedPdf = input.files[0];
  }

  clearFiles() {
    this.selectedImage = null;
    this.selectedPdf = null;
    this.imagePreview = null;
    const imgEl = document.getElementById(
      'image-input'
    ) as HTMLInputElement | null;
    if (imgEl) imgEl.value = '';
    const pdfEl = document.getElementById(
      'pdf-input'
    ) as HTMLInputElement | null;
    if (pdfEl) pdfEl.value = '';
  }
}
