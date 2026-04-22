import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {
  // NOTE: keep this pointing to the sessions microservice
  private baseUrl = 'http://localhost:8090/api/sessions';

  constructor(private http: HttpClient) {}

  getAllSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.baseUrl}/all`);
  }

  addSession(session: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, session);
  }

  deleteSession(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  updateSession(id: number, session: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, session);
  }

  getSessionById(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.baseUrl}/${id}`);
  }

  getSessionsByTrainerId(trainerId: number): Observable<Session[]> {
    return this.http.get<Session[]>(
      `${this.baseUrl}/sessions/trainer/${trainerId}`
    );
  }

  joinSession(sessionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${sessionId}/join`, {});
  }

  leaveSession(sessionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${sessionId}/leave`, {});
  }
}
