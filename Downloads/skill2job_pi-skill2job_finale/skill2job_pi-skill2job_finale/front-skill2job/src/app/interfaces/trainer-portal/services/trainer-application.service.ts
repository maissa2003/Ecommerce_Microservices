import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainerApplicationService {
  private baseUrl = 'http://localhost:8090/api/applications';

  constructor(private http: HttpClient) {}

  submit(application: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, application);
  }

  submitApplication(application: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, application);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  getByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/me?userId=${userId}`);
  }

  exists(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/exists?userId=${userId}`);
  }

  update(applicationId: number, application: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${applicationId}`, application);
  }

  delete(applicationId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${applicationId}`);
  }

  list(status?: string): Observable<any> {
    if (status) {
      return this.http.get(`${this.baseUrl}?status=${status}`);
    }
    return this.http.get(`${this.baseUrl}`);
  }

  updateStatus(applicationId: number, status: string): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/${applicationId}/status?status=${status}`,
      {}
    );
  }

  analyze(applicationId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${applicationId}/analyze`, {});
  }

  decision(applicationId: number, decision: string): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/${applicationId}/decision?decision=${decision}`,
      {}
    );
  }

  getDetailsByApplicationId(applicationId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${applicationId}`);
  }
}
