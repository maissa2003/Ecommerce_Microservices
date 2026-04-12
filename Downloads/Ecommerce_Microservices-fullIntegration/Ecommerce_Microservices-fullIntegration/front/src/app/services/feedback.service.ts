import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type FeedbackStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Feedback {
  id?: number;
  articleId: number;
  userId: number;
  comment: string;
  rating: number;
  status?: FeedbackStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedbackStats {
  articleId: number;
  averageRating: number;
  totalApproved: number;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:8088/api/feedbacks';

  constructor(private http: HttpClient) {}

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  getAll(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.apiUrl);
  }

  getById(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.apiUrl}/${id}`);
  }

  create(feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(this.apiUrl, feedback);
  }

  update(id: number, feedback: Feedback): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.apiUrl}/${id}`, feedback);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ─── Par article ────────────────────────────────────────────────────────────

  getByArticle(articleId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/article/${articleId}`);
  }

  getApprovedByArticle(articleId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(
      `${this.apiUrl}/article/${articleId}/approved`
    );
  }

  getStatsByArticle(articleId: number): Observable<FeedbackStats> {
    return this.http.get<FeedbackStats>(
      `${this.apiUrl}/article/${articleId}/stats`
    );
  }

  // ─── Par utilisateur ────────────────────────────────────────────────────────

  getByUser(userId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/user/${userId}`);
  }

  // ─── Modération ─────────────────────────────────────────────────────────────

  getPending(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}/pending`);
  }

  approve(id: number): Observable<Feedback> {
    return this.http.patch<Feedback>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: number): Observable<Feedback> {
    return this.http.patch<Feedback>(`${this.apiUrl}/${id}/reject`, {});
  }
}
