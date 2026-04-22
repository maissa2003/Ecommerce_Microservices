import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TrainerProfileFoService {
  private baseUrl = 'http://localhost:8090/api/trainer-profiles';
  private detailsUrl = 'http://localhost:8090/api/admin/trainer-details';

  constructor(private http: HttpClient) {}

  getMine(userId: number): Observable<any> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get(`${this.baseUrl}/me`, { params });
  }

  getDetailsByApplicationId(applicationId: number): Observable<any> {
    return this.http.get(`${this.detailsUrl}/by-application/${applicationId}`);
  }
}
