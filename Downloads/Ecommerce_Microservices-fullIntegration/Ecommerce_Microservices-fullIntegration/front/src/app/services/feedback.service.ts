import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Feedback {
  id?: number;
  articleId: number;
  userId: number;
  comment: string;
  rating: number;
  status?: string;
  adminNote?: string; // ✅ NOUVEAU
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedbackStats {
  articleId: number;
  averageRating: number;
  totalApproved: number;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private base = 'http://localhost:8088/api/feedbacks';

  constructor(private http: HttpClient) {}

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  getAll(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.base);
  }

  getById(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.base}/${id}`);
  }

  create(feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(this.base, feedback);
  }

  update(id: number, feedback: Feedback): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.base}/${id}`, feedback);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // ─── Par article ────────────────────────────────────────────────────────────

  getByArticle(articleId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.base}/article/${articleId}`);
  }

  getApprovedByArticle(articleId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(
      `${this.base}/article/${articleId}/approved`
    );
  }

  getStatsByArticle(articleId: number): Observable<FeedbackStats> {
    return this.http.get<FeedbackStats>(
      `${this.base}/article/${articleId}/stats`
    );
  }

  // ─── Modération ─────────────────────────────────────────────────────────────

  getPending(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.base}/pending`);
  }

  approve(id: number): Observable<Feedback> {
    return this.http.patch<Feedback>(`${this.base}/${id}/approve`, {});
  }

  reject(id: number): Observable<Feedback> {
    return this.http.patch<Feedback>(`${this.base}/${id}/reject`, {});
  }

  // ─── ✅ NOUVEAU : Note admin ─────────────────────────────────────────────────

  addAdminNote(id: number, adminNote: string): Observable<Feedback> {
    return this.http.patch<Feedback>(`${this.base}/${id}/admin-note`, {
      adminNote
    });
  }

  // ─── ✅ NOUVEAU : Actions en lot ─────────────────────────────────────────────

  bulkApprove(ids: number[]): Observable<any> {
    return this.http.post<any>(`${this.base}/bulk/approve`, { ids });
  }

  bulkReject(ids: number[]): Observable<any> {
    return this.http.post<any>(`${this.base}/bulk/reject`, { ids });
  }

  bulkDelete(ids: number[]): Observable<any> {
    return this.http.post<any>(`${this.base}/bulk/delete`, { ids });
  }

  // ─── ✅ NOUVEAU : Stats globales admin ──────────────────────────────────────

  getGlobalStats(): Observable<any> {
    return this.http.get<any>(`${this.base}/admin/global-stats`);
  }
}
