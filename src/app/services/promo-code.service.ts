import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PromoCode {
  id?: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  expiryDate: string;
  maxUsages: number;
  currentUsages?: number;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PromoCodeService {

  private baseUrl = 'http://localhost:8080/api/promos';

  constructor(private http: HttpClient) { }

  getAllCodes(): Observable<PromoCode[]> {
    return this.http.get<PromoCode[]>(this.baseUrl);
  }

  createCode(code: PromoCode): Observable<PromoCode> {
    return this.http.post<PromoCode>(this.baseUrl, code);
  }

  updateCode(id: number, code: PromoCode): Observable<PromoCode> {
    return this.http.put<PromoCode>(`${this.baseUrl}/${id}`, code);
  }

  toggleActive(id: number): Observable<PromoCode> {
    return this.http.put<PromoCode>(`${this.baseUrl}/${id}/toggle`, {});
  }

  deleteCode(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
