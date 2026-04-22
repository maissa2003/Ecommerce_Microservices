import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PcOffer } from '../models/pc-offer.model';

@Injectable({
  providedIn: 'root'
})
export class PcService {
  private apiUrl = 'http://localhost:8090/pc/search';

  constructor(private http: HttpClient) {}

  getOffers(maxPrice?: number, minRam?: number): Observable<PcOffer[]> {
    let params = new HttpParams();

    if (
      maxPrice !== undefined &&
      maxPrice !== null &&
      String(maxPrice).trim() !== ''
    ) {
      params = params.set('maxBudget', maxPrice);
    }

    if (
      minRam !== undefined &&
      minRam !== null &&
      String(minRam).trim() !== ''
    ) {
      params = params.set('minRam', minRam);
    }

    return this.http.get<PcOffer[]>(this.apiUrl, { params });
  }
}
