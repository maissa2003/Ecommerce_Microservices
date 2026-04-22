import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export type ApplicationStatus =
  | 'SENT'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'ACCEPTED';

export interface ApplyRequest {
  jobOfferId: number;
  motivation: string;
  cvUrl?: string;
}

/**
 * ✅ NEW: Interview scheduling payload (Partner enters meet link + datetime + optional note)
 * - interviewAt: ISO string (ex: "2026-02-28T14:30:00")
 * - meetLink: Google Meet URL
 */
export interface ScheduleInterviewRequest {
  interviewAt: string; // ISO datetime string
  meetLink: string; // https://meet.google.com/...
  note?: string; // optional message
}

/**
 * ✅ NEW: ApplicationResponse extended for interview
 */
export interface ApplicationResponse {
  id: number;
  status: ApplicationStatus;
  appliedAt: string;

  offerId: number;
  offerTitle: string;
  location: string;

  partnerId: number;
  partnerName: string;

  studentUsername: string;
  studentEmail: string;

  cvUrl?: string | null;
  motivation?: string | null;
  // ✅ SCORE
  score?: number | null;
  autoShortlisted?: boolean;

  // ✅ NEW (Interview)
  interviewAt?: string | null; // ISO datetime
  meetLink?: string | null;
  interviewNote?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private baseUrl = 'http://localhost:8090/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
      // ✅ Do NOT set Content-Type here for FormData (browser will set boundary)
    });
  }

  // ===============================
  // APPLY WITH FILES (Multipart)
  // ===============================
  applyWithFiles(formData: FormData): Observable<string> {
    return this.http.post(`${this.baseUrl}/applications`, formData, {
      headers: this.authHeaders(),
      responseType: 'text'
    });
  }

  // ===============================
  // OLD APPLY (JSON) - keep if you still need it
  // ⚠️ Your backend now consumes multipart/form-data on /applications
  // so this will fail unless you keep a separate JSON endpoint.
  // ===============================
  apply(data: ApplyRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/applications`, data, {
      headers: this.authHeaders(),
      responseType: 'text'
    });
  }

  // ===============================
  // LEARNER: My applications
  // ===============================
  myApplications(): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(
      `${this.baseUrl}/applications/me`,
      {
        headers: this.authHeaders()
      }
    );
  }

  // ===============================
  // LEARNER: check already applied
  // ===============================
  hasApplied(offerId: number): Observable<{ applied: boolean }> {
    return this.http.get<{ applied: boolean }>(
      `${this.baseUrl}/applications/has-applied/${offerId}`,
      { headers: this.authHeaders() }
    );
  }

  // ===============================
  // PARTNER: applications for one offer
  // ===============================
  getApplicationsForOffer(offerId: number): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(
      `${this.baseUrl}/partner/offers/${offerId}/applications`,
      { headers: this.authHeaders() }
    );
  }

  // ===============================
  // PARTNER: update status
  // ===============================
  updateStatus(id: number, status: ApplicationStatus): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/partner/applications/${id}/status`,
      { status },
      { headers: this.authHeaders(), responseType: 'text' }
    );
  }

  // ===============================
  // ✅ NEW: PARTNER schedules interview (meet link + date)
  // Endpoint (backend): PUT /api/partner/applications/{id}/interview
  // ===============================
  scheduleInterview(
    id: number,
    payload: ScheduleInterviewRequest
  ): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/partner/applications/${id}/interview`,
      payload,
      { headers: this.authHeaders(), responseType: 'text' }
    );
  }
}
