import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

// ✅ NO AuthService import — JwtInterceptor handles headers automatically

export interface Wallet {
  id: number;
  userId: number;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: number;
  walletId: number;
  userId: number;
  type: 'CREDIT' | 'DEBIT' | 'WELCOME_BONUS' | 'REFUND' | 'PAYMENT';
  amount: number;
  description: string;
  createdAt: string;
}

export interface SpinHistory {
  id: number;
  userId: number;
  spinDate: string;
  pointsWon: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private apiUrl = `${environment.apiUrl}/wallet`;

  // ✅ Only HttpClient — NO AuthService, NO getAuthHeaders()
  // JwtInterceptor adds Bearer token automatically to every request
  constructor(private http: HttpClient) {}

  getMyWallet(): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.apiUrl}/me`);
  }

  getBalance(): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${this.apiUrl}/balance`);
  }

  getTransactions(): Observable<WalletTransaction[]> {
    return this.http.get<WalletTransaction[]>(`${this.apiUrl}/transactions`);
  }

  canSpinToday(): Observable<{ canSpin: boolean }> {
    return this.http.get<{ canSpin: boolean }>(`${this.apiUrl}/can-spin`);
  }

  spinWheel(): Observable<{
    success: boolean;
    pointsWon: number;
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/spin`, {});
  }

  getSpinHistory(): Observable<SpinHistory[]> {
    return this.http.get<SpinHistory[]>(`${this.apiUrl}/spin-history`);
  }
}
