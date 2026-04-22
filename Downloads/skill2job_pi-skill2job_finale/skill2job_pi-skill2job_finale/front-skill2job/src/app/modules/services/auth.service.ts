import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Interface pour la réponse JWT
export interface JwtResponse {
  token: string;
  type: string;
  username: string;
  email?: string;
  id?: number;
  roles: string[];
}

// ✅ Interface pour les utilisateurs
export interface User {
  id: number;
  username: string;
  email: string;
  roles: { id: number; name: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8090/api';

  constructor(private http: HttpClient) {}

  // ──────────────────────────────────────
  //  AUTH
  // ──────────────────────────────────────

  login(username: string, password: string): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.baseUrl}/auth/login`, {
      username,
      password
    });
  }

  register(
    username: string,
    email: string,
    password: string,
    roles: string[]
  ): Observable<string> {
    return this.http.post(
      `${this.baseUrl}/auth/register`,
      { username, email, password, roles },
      { responseType: 'text' } // ✅ Spring retourne un String pas du JSON
    );
  }

  // ──────────────────────────────────────
  //  TOKEN
  // ──────────────────────────────────────

  saveToken(token: string, userInfo: JwtResponse): void {
    console.log('📝 saveToken called with:', {
      token: token ? 'EXISTS' : 'MISSING',
      userInfo
    });

    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      console.log(
        '✅ LocalStorage updated. "user" is now:',
        localStorage.getItem('user')
      );
    } catch (e) {
      console.error('❌ Error saving to localStorage:', e);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): JwtResponse | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.warn('🔍 getCurrentUser - no "user" found in localStorage');
      return null;
    }

    try {
      const user = JSON.parse(userStr);
      return user;
    } catch (e) {
      console.error('🔍 getCurrentUser - JSON parse error:', e);
      return null;
    }
  }

  getCurrentUserId(): number | null {
    console.log('🔍 getCurrentUserId check started...');

    const user = this.getCurrentUser();

    // 1. Prioritize 'id' or 'userId' in the JSON object
    if (user) {
      console.log('🔍 Checking user object fields:', Object.keys(user));
      if (user.id) {
        console.log('✅ Found userId in user.id:', user.id);
        return Number(user.id);
      }
      if ((user as any).userId) {
        console.log('✅ Found userId in user.userId:', (user as any).userId);
        return Number((user as any).userId);
      }
    }

    const token = this.getToken();
    if (token) {
      try {
        const payload = this.decodeToken(token);
        console.log(
          '🔍 Checking JWT payload fields:',
          payload ? Object.keys(payload) : 'NULL'
        );

        if (payload) {
          if (payload.id) {
            console.log('✅ Found userId in JWT "id":', payload.id);
            return Number(payload.id);
          }
          if (payload.userId) {
            console.log('✅ Found userId in JWT "userId":', payload.userId);
            return Number(payload.userId);
          }
          if (payload.sub && !isNaN(Number(payload.sub))) {
            console.log('✅ Found userId in JWT "sub":', payload.sub);
            return Number(payload.sub);
          }
        }
      } catch (e) {
        console.error('❌ JWT Decode failure:', e);
      }
    }

    // 2. Admin fallback
    const userRole = this.getUserRoleString();
    if (userRole === 'ROLE_ADMIN') {
      console.log('⚠️ Admin detected - defaulting to ID 1');
      return 1;
    }

    console.error('❌ Could not determine user ID from storage or token.');
    return null;
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('❌ Error in decodeToken:', e);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ──────────────────────────────────────
  //  HEADERS avec token
  // ──────────────────────────────────────

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  // ──────────────────────────────────────
  //  CRUD USERS (ADMIN seulement)
  // ──────────────────────────────────────

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/admin/users`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/admin/users/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateUser(id: number, data: any): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/admin/users/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/admin/users/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Add this method to safely get user role as string
  getUserRoleString(): string | null {
    const user = this.getCurrentUser();
    if (!user || !user.roles || user.roles.length === 0) {
      return null;
    }

    const firstRole = user.roles[0];

    // Handle string role
    if (typeof firstRole === 'string') {
      return firstRole;
    }

    // Handle object role
    if (firstRole && typeof firstRole === 'object') {
      // Try to get name property
      const roleObj = firstRole as any;
      return roleObj.name || roleObj.role || null;
    }

    return null;
  }
}
