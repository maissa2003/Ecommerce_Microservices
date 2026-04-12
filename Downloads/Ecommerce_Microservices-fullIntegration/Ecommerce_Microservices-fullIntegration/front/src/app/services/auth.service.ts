import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  nom: string;
  email: string;
  password: string;
}
export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  role: string;
}
export interface AuthResponse {
  token: string;
  user: Utilisateur;
}
export interface ProfileResponse {
  nom: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = 'http://localhost:8088/api/auth';
  private usersBase = 'http://localhost:8088/api/users';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/login`, credentials)
      .pipe(tap(response => this.saveSession(response)));
  }

  register(user: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.base}/register`, user)
      .pipe(tap(response => this.saveSession(response)));
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(
      `${this.base}/forgot-password`,
      { email },
      { responseType: 'text' }
    );
  }

  resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Observable<any> {
    return this.http.post(
      `${this.base}/reset-password`,
      { email, otp, newPassword },
      { responseType: 'text' }
    );
  }

  updateMyProfile(nom: string, email: string): Observable<ProfileResponse> {
    return this.http
      .put<ProfileResponse>(`${this.usersBase}/me/profile`, { nom, email })
      .pipe(
        tap(response => {
          localStorage.setItem('userName', response.nom);
          localStorage.setItem('userEmail', response.email);
        })
      );
  }

  changeMyPassword(
    currentPassword: string,
    newPassword: string
  ): Observable<any> {
    return this.http.put(
      `${this.usersBase}/me/password`,
      { currentPassword, newPassword },
      { responseType: 'text' }
    );
  }

  private saveSession(response: AuthResponse): void {
    if (!response?.token || !response?.user) return;
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('userId', response.user.id.toString());
    localStorage.setItem('userRole', response.user.role);
    localStorage.setItem('userEmail', response.user.email);
    localStorage.setItem('userName', response.user.nom);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/signin']);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
  getUserId(): number {
    return Number(localStorage.getItem('userId') || '1');
  }
  getRole(): string | null {
    return localStorage.getItem('userRole');
  }
  getUserName(): string | null {
    return localStorage.getItem('userName');
  }
  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }
  isCustomer(): boolean {
    return this.getRole() === 'CUSTOMER';
  }
}
