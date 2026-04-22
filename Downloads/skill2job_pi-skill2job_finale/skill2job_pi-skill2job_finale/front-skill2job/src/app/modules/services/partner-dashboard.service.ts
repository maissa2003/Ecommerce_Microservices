import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface PartnerDashboardResponse {
  totalOffers: number;
  openOffers: number;
  closedOffers: number;

  totalApplications: number;
  applicationsByStatus: Record<string, number>;

  interviewsScheduled: number;
  upcomingInterviewsCount: number;

  offersExpiringSoonCount: number;

  // ✅ NEW KPIs
  avgScore: number; // ex: 72.4
  shortlistedRate: number; // ex: 18.2 (percentage)
  acceptanceRate: number; // ex: 5.1  (percentage)

  recentApplications: Array<{
    applicationId: number;
    status: string;
    appliedAt: string;
    offerId: number;
    offerTitle: string;
    studentUsername: string;
    studentEmail: string;
    score?: number | null; // ✅ NEW
    cvUrl?: string | null;
    motivation?: string | null;
  }>;

  upcomingInterviews: Array<{
    applicationId: number;
    interviewAt: string;
    meetLink?: string | null;
    note?: string | null;
    offerId: number;
    offerTitle: string;
    studentUsername: string;
    studentEmail: string;
  }>;

  topOffers: Array<{
    offerId: number;
    offerTitle: string;
    status: string;
    deadline?: string | null;
    applicationsCount: number;
  }>;

  // ✅ NEW: Top candidates
  topCandidates: Array<{
    applicationId: number;
    status: string;
    appliedAt: string;
    offerId: number;
    offerTitle: string;
    studentUsername: string;
    studentEmail: string;
    score?: number | null;
  }>;
}

@Injectable({ providedIn: 'root' })
export class PartnerDashboardService {
  private baseUrl = 'http://localhost:8090/api/partner';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getDashboard(): Observable<PartnerDashboardResponse> {
    return this.http.get<PartnerDashboardResponse>(
      `${this.baseUrl}/dashboard`,
      {
        headers: this.headers()
      }
    );
  }
}
