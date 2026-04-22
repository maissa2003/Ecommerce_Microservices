import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainerApplicationFoService {
  // ✅ Backend port 8087 (ton Spring)
  private baseUrl = 'http://localhost:8090/api/applications';

  constructor(private http: HttpClient) {}

  submit(body: {
    userId: number;
    cvUrl: string;
    motivation: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}`, body);
  }

  getByUserId(userId: number): Observable<any> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get(`${this.baseUrl}/me`, { params });
  }

  update(
    id: number,
    body: { cvUrl?: string; motivation?: string }
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  exists(userId: number): Observable<string> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<string>(`${this.baseUrl}/exists`, { params });
  }
  getDetailsByApplicationId(applicationId: number): Observable<any> {
    return this.http.get(
      `http://localhost:8090/api/admin/trainer-details/by-application/${applicationId}`
    );
  }
}
