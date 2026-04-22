import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partner } from '../models/partner.model';

@Injectable({ providedIn: 'root' })
export class PartnerService {
  private baseUrl = 'http://localhost:8090/api/partners';

  constructor(private http: HttpClient) {}

  // ================= EMPLOYER (connecté) =================
  getMyPartner(): Observable<Partner> {
    return this.http.get<Partner>(`${this.baseUrl}/me`);
  }

  createMyPartner(data: Partial<Partner>): Observable<Partner> {
    return this.http.post<Partner>(`${this.baseUrl}/me`, data);
  }

  updateMyPartner(data: Partial<Partner>): Observable<Partner> {
    return this.http.put<Partner>(`${this.baseUrl}/me`, data);
  }

  deleteMyPartner(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/me`);
  }

  // ================= ADMIN =================
  getAllPartners(): Observable<Partner[]> {
    return this.http.get<Partner[]>(`${this.baseUrl}/all`);
  }

  updatePartnerStatus(partnerId: number, status: string): Observable<Partner> {
    return this.http.put<Partner>(
      `${this.baseUrl}/${partnerId}/status?status=${status}`,
      {}
    );
  }

  deletePartnerById(partnerId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${partnerId}`);
  }

  getPartnerById(id: number): Observable<Partner> {
    return this.http.get<Partner>(`${this.baseUrl}/${id}`);
  }

  // ================= ✅ EXPORT PDF (ADMIN) =================
  // Backend endpoint attendu: GET /api/partners/export-pdf
  exportPartnersPdf(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/admin/export/pdf`, {
      responseType: 'blob'
    });
  }

  // (Optionnel) Export PDF d'un partner précis (si tu crées l'endpoint côté backend)
  // exportPartnerPdf(partnerId: number): Observable<Blob> {
  //   return this.http.get(`${this.baseUrl}/${partnerId}/export-pdf`, { responseType: 'blob' });
  // }
}
