import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Equipment } from '../models/equipment.model';
import { EquipmentReservation } from '../models/session-equipment.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private baseUrl = 'http://localhost:8090/api/equipments';

  constructor(private http: HttpClient) {}

  getAllEquipments(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.baseUrl}/all`);
  }

  addWithPhoto(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-with-photo`, formData);
  }

  add(equipment: Equipment): Observable<Equipment> {
    return this.http.post<Equipment>(`${this.baseUrl}/add`, equipment);
  }

  deleteEquipment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  updateEquipment(id: number, equipment: Equipment): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.baseUrl}/update/${id}`, equipment);
  }

  getById(id: number): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.baseUrl}/${id}`);
  }

  updateWithPhoto(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-with-photo/${id}`, formData);
  }

  getAvailableEquipments(start: string, end: string): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(
      `${this.baseUrl}/available?startAt=${start}&endAt=${end}`
    );
  }

  getPhotoUrl(filename: string): string {
    return `${this.baseUrl}/photo/${filename}`;
  }

  getReservations(equipmentId: number): Observable<EquipmentReservation[]> {
    return this.http.get<EquipmentReservation[]>(
      `${this.baseUrl}/${equipmentId}/reservations`
    );
  }
}
