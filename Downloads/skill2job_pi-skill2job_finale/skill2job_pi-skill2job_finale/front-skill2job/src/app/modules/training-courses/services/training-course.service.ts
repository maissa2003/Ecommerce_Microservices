import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpErrorResponse,
  HttpEventType
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainingCourseService {
  private apiUrl = `${environment.apiUrl}/training-courses`;

  constructor(private http: HttpClient) {}

  // Create with files
  create(courseData: any): Observable<any> {
    return this.http
      .post(this.apiUrl, courseData, {
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        map((event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              const progress = event.total
                ? Math.round((100 * event.loaded) / event.total)
                : 0;
              console.log('Upload Progress:', progress + '%');
              break;
            case HttpEventType.Response:
              return event.body;
          }
        }),
        catchError(this.handleError)
      );
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  update(id: number, courseData: any): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/${id}`, courseData, {
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        map((event: HttpEvent<any>) => {
          if (event.type === HttpEventType.Response) return event.body;
        }),
        catchError(this.handleError)
      );
  }

  delete(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      message = `Client-side error: ${error.error.message}`;
    } else if (error.status === 413) {
      message = 'File too large! Please select a smaller file.';
    } else if (error.error) {
      message = error.error;
    }
    return throwError(() => new Error(message));
  }
}
