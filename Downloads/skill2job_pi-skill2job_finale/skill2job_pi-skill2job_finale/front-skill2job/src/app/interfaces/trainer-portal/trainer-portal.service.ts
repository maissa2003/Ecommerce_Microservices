import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainerPortalService {
  private baseUrl = 'http://localhost:8090/api';

  constructor(private http: HttpClient) {}

  // Submit trainer application
  submitApplication(application: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/applications`, application);
  }

  // Get my applications
  getMyApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/applications/my`);
  }

  // Get my application status
  getMyApplicationStatus(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/applications/status`);
  }

  // Get my trainer profile
  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/trainer-profile/my`);
  }

  // Update my trainer profile
  updateMyProfile(profile: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/trainer-profile/my`, profile);
  }

  // Get messages for trainer
  getMyMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/messages/trainer`);
  }

  // Mark message as read
  markMessageAsRead(messageId: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/messages/${messageId}/read`, {});
  }
}
