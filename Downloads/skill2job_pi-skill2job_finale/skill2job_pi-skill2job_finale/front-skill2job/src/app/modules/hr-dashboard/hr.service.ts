import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HrService {
  private baseUrl = 'http://localhost:8090/api'; // API Gateway (preferred)
  private directUrl = 'http://localhost:8090/api';

  constructor(private http: HttpClient) {}

  // Get all trainer applications
  getAllApplications(): Observable<any[]> {
    // Try API Gateway first, fallback to direct service
    return this.http.get<any[]>(`${this.directUrl}/applications`);
  }

  // Get application by ID
  getApplicationById(id: number): Observable<any> {
    return this.http.get<any>(`${this.directUrl}/applications/${id}`);
  }

  // Approve application
  approveApplication(id: number): Observable<any> {
    return this.http.put<any>(
      `${this.directUrl}/applications/${id}/approve`,
      {}
    );
  }

  // Reject application
  rejectApplication(id: number, reason?: string): Observable<any> {
    const body = reason ? { reason } : {};
    return this.http.put<any>(
      `${this.directUrl}/applications/${id}/reject`,
      body
    );
  }

  // Get all trainer details
  getAllTrainerDetails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/trainer-details`);
  }

  // Create trainer details
  createTrainerDetails(details: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/admin/trainer-details`,
      details
    );
  }

  // Update trainer details
  updateTrainerDetails(id: number, details: any): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/admin/trainer-details/${id}`,
      details
    );
  }

  // Delete trainer details
  deleteTrainerDetails(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/admin/trainer-details/${id}`);
  }

  // Get messages
  getAllMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/messages`);
  }

  // Send message
  sendMessage(message: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/messages`, message);
  }
}
