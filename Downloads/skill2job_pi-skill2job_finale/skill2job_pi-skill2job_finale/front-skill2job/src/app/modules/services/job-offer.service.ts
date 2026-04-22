import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobOffer } from '../models/job-offer.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class JobOfferService {
  private baseUrl = 'http://localhost:8090/api/offers';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // GET /api/offers
  getAllOffers(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.baseUrl}`, {
      headers: this.authHeaders()
    });
  }

  // GET /api/offers/partner/{partnerId}
  getOffersByPartnerId(partnerId: number): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.baseUrl}/partner/${partnerId}`, {
      headers: this.authHeaders()
    });
  }

  // GET /api/offers/{offerId}
  getOfferById(offerId: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.baseUrl}/${offerId}`, {
      headers: this.authHeaders()
    });
  }

  // POST /api/offers
  addOffer(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, payload, {
      headers: this.authHeaders()
    });
  }

  // PUT /api/offers/{offerId}
  updateOffer(offerId: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${offerId}`, payload, {
      headers: this.authHeaders()
    });
  }

  // DELETE /api/offers/{offerId}
  deleteOffer(offerId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${offerId}`, {
      headers: this.authHeaders()
    });
  }

  // PUT /api/offers/{offerId}/status?status=OPEN|CLOSED
  updateOfferStatus(offerId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${offerId}/status?status=${status}`,
      {},
      { headers: this.authHeaders() }
    );
  }
}
