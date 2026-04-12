import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const isAuthEndpoint =
      req.url.includes('/api/auth/login') ||
      req.url.includes('/api/auth/register') ||
      req.url.includes('/api/auth/forgot-password') ||
      req.url.includes('/api/auth/reset-password');

    if (token && !isAuthEndpoint) {
      const headers: { [key: string]: string } = {
        Authorization: `Bearer ${token}`
      };

      // Only set application/json if we are not sending FormData
      // Sending FormData (like in file uploads) requires the browser to set the boundary
      if (!(req.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      req = req.clone({ setHeaders: headers });
    }

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        // ✅ Only logout on 401 (expired/invalid token)
        // Do NOT logout on 403 — that means auth succeeded but access denied
        if (err.status === 401) {
          this.authService.logout();
        }
        return throwError(() => err);
      })
    );
  }
}
