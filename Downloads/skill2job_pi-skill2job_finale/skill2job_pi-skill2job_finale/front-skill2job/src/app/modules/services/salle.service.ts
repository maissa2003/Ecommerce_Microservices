import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Salle } from '../models/salle.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalleService {
  private api = 'http://localhost:8090/api/salles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Salle[]> {
    return this.http.get<Salle[]>(`${this.api}/all`);
  }

  getById(id: number): Observable<Salle> {
    return this.http.get<Salle>(`${this.api}/${id}`);
  }

  add(salle: Salle): Observable<any> {
    return this.http.post(`${this.api}/add`, salle);
  }

  update(id: number, salle: Salle): Observable<any> {
    return this.http.put(`${this.api}/update/${id}`, salle);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/delete/${id}`);
  }
}
