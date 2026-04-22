import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-trainer-courses',
  templateUrl: './trainer-courses.component.html',
  styleUrls: ['./trainer-courses.component.css']
})
export class TrainerCoursesComponent implements OnInit {
  courses: any[] = [];
  loading = true;
  error = false;

  private base = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    const userInfo = this.authService.getCurrentUser();

    if (!userInfo?.username) {
      this.loading = false;
      this.error = true;
      return;
    }

    this.http.get<any[]>(`${this.base}/users/trainers`).subscribe({
      next: trainers => {
        const currentTrainer = trainers.find(
          t => t.username === userInfo.username
        );

        if (!currentTrainer?.id) {
          this.loading = false;
          this.error = true;
          return;
        }

        this.loadMyCourses(currentTrainer.id);
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  loadMyCourses(trainerId: number): void {
    this.loading = true;
    this.http
      .get<any[]>(`${this.base}/training-courses/trainer/${trainerId}`)
      .subscribe({
        next: data => {
          this.courses = data || [];
          this.loading = false;
        },
        error: () => {
          this.courses = [];
          this.loading = false;
          this.error = true;
        }
      });
  }

  getCurrencySymbol(code: string): string {
    return ({ USD: '$', EUR: '€', TND: 'DT' } as any)[code] || '$';
  }

  getPdfCount(course: any): number {
    return course.pdfUrls?.length || 0;
  }

  formatPrice(price: number): string {
    if (price == null) return '0.00';
    return price.toFixed(2);
  }
}
