import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface CourseProgress {
  id: number;
  userId: number;
  courseId: number;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  isCompleted: boolean;
  startedAt: string;
  lastAccessedAt: string;
  completedAt?: string;
  rewardClaimed: boolean;
}

@Injectable({ providedIn: 'root' })
export class CourseProgressService {
  private apiUrl = `${environment.apiUrl}/progress`;

  constructor(private http: HttpClient) {}

  startCourse(
    courseId: number,
    totalLessons: number
  ): Observable<CourseProgress> {
    return this.http.post<CourseProgress>(`${this.apiUrl}/start`, {
      courseId,
      totalLessons
    });
  }

  updateProgress(
    courseId: number,
    lessonNumber: number
  ): Observable<CourseProgress> {
    return this.http.put<CourseProgress>(`${this.apiUrl}/update`, {
      courseId,
      lessonNumber
    });
  }

  getProgress(
    courseId: number
  ): Observable<CourseProgress | { exists: boolean }> {
    return this.http.get<CourseProgress | { exists: boolean }>(
      `${this.apiUrl}/course/${courseId}`
    );
  }

  getMyProgress(): Observable<CourseProgress[]> {
    return this.http.get<CourseProgress[]>(`${this.apiUrl}/me`);
  }

  getCompletedCourses(): Observable<CourseProgress[]> {
    return this.http.get<CourseProgress[]>(`${this.apiUrl}/completed`);
  }

  resetProgress(courseId: number): Observable<CourseProgress> {
    return this.http.put<CourseProgress>(
      `${this.apiUrl}/reset/${courseId}`,
      {}
    );
  }
}
