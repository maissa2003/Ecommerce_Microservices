import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private baseUrl = 'http://localhost:8090/api/messages';

  constructor(private http: HttpClient) {}

  send(message: {
    senderId: number;
    receiverId: number;
    applicationId: number;
    content: string;
    senderRole: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}`, message);
  }

  getConversation(applicationId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/conversation/${applicationId}`
    );
  }

  getUnread(receiverId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/unread/${receiverId}`);
  }

  countUnread(receiverId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.baseUrl}/unread/${receiverId}/count`
    );
  }

  markAsRead(applicationId: number, receiverId: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/read/${applicationId}/${receiverId}`,
      {}
    );
  }
}
