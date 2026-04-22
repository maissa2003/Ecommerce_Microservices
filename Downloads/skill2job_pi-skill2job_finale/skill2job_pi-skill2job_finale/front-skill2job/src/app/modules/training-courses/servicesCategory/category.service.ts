import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Category {
  id?: number;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  /** Gateway: /api/categories/** → formation-service (GestionFormation CategoryController) */
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http
      .get<Category[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<Category> {
    return this.http
      .get<Category>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(category: Category): Observable<Category> {
    return this.http
      .post<Category>(this.apiUrl, category)
      .pipe(catchError(this.handleError));
  }

  // ✅ UPDATE FIX
  update(id: number, category: Category): Observable<Category> {
    // Important — backend souvent exige l’id dans le body
    const payload = {
      ...category,
      id: id
    };

    return this.http
      .put<Category>(`${this.apiUrl}/${id}`, payload)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Erreur inconnue';

    if (error.status === 0) {
      message = 'Connexion backend impossible';
    } else if (error.status === 200 && error.error instanceof ProgressEvent) {
      message =
        'Réponse non-JSON (souvent index.html). Vérifiez proxy dev-server → gateway :8090.';
    } else if (
      typeof error.message === 'string' &&
      error.message.includes('Http failure during parsing')
    ) {
      message =
        'Réponse invalide (non-JSON). Vérifiez que ng serve utilise proxy.conf.json vers le gateway.';
    } else if (error.error?.message) {
      message = error.error.message;
    } else {
      message = `Erreur serveur: ${error.status}`;
    }

    console.error('HTTP ERROR:', error);
    return throwError(() => new Error(message));
  }
}
