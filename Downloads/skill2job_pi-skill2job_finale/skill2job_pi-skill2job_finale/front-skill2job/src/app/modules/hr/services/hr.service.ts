import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HrService {
  private baseUrl = 'http://localhost:8090/api/applications';

  constructor(private http: HttpClient) {}

  getAllApplications(status?: string): Observable<any[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<any[]>(this.baseUrl, { params });
  }

  analyzeApplication(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/analyze`, {});
  }

  decide(id: number, decision: 'ACCEPT' | 'REJECT'): Observable<any> {
    const params = new HttpParams().set('decision', decision);
    return this.http.patch(`${this.baseUrl}/${id}/decision`, {}, { params });
  }

  deleteApplication(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
