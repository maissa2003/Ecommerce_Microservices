import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bloc } from '../models/blocs.model';

@Injectable({
  providedIn: 'root'
})
export class BlocService {
  private apiUrl = 'http://localhost:8090/api/blocs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Bloc[]> {
    return this.http.get<Bloc[]>(`${this.apiUrl}/all`);
  }

  add(bloc: Bloc): Observable<Bloc> {
    return this.http.post<Bloc>(`${this.apiUrl}/add`, bloc);
  }

  update(id: number, bloc: Bloc): Observable<Bloc> {
    return this.http.put<Bloc>(`${this.apiUrl}/update/${id}`, bloc);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
