import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Coupon {
  id?: number;
  code: string; // e.g. "SUMMER25"
  discountPercentage: number; // 20 = 20 %
  expiryDate: string; // ISO date "YYYY-MM-DD"
  active: boolean;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly BASE = `${environment.apiUrl}/coupons`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.BASE);
  }

  create(coupon: Coupon): Observable<Coupon> {
    return this.http.post<Coupon>(this.BASE, coupon);
  }

  update(id: number, coupon: Coupon): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.BASE}/${id}`, coupon);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  toggle(id: number): Observable<Coupon> {
    return this.http.patch<Coupon>(`${this.BASE}/${id}/toggle`, {});
  }
}
