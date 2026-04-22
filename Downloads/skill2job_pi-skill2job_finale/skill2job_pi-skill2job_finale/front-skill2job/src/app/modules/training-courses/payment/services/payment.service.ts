import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

// ── DTOs ────────────────────────────────────────────────────────────────────

export interface PaymentRequest {
  courseId: number;
  amount?: number; // null/undefined when paying with points (WALLET)
  currency?: string;
  paymentMethod: 'CREDIT_CARD' | 'WALLET' | 'BANK_TRANSFER';
  couponCode?: string; // optional
  cardHolderName?: string;
  cardLast4?: string;
  cardType?: string;
  billingCountry?: string;
  // ── kept for local form use, NOT sent to backend ──────────────
  cardNumber?: string; // stripped before sending
  cardExpiry?: string;
  cardCVC?: string;
}

export interface PaymentResponse {
  id: number;
  transactionId: string;
  userId: number;
  username?: string;
  courseId: number;
  originalPrice: number;
  finalPrice: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  paymentMethod: string;
  cardLast4?: string;
  cardType?: string;
  cardHolderName?: string;
  billingCountry?: string;
  adminNotes?: string;
  couponCode?: string;
  discountPercentage?: number;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  discountPercentage: number;
  message?: string;
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly BASE = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  // ── User endpoints ────────────────────────────────────────────────────────

  /**
   * Initiate a payment (CREDIT_CARD, WALLET, or BANK_TRANSFER).
   * Strips client-only fields (cardNumber, cardExpiry, cardCVC) before sending.
   */
  initiatePayment(data: PaymentRequest): Observable<PaymentResponse> {
    const payload = this.buildPayload(data);
    return this.http.post<PaymentResponse>(`${this.BASE}/initiate`, payload);
  }

  /** Returns the calling user's payment history. */
  getMyPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.BASE}/me`);
  }

  /** Check whether the current user has access to a course. */
  checkAccess(courseId: number): Observable<{ hasAccess: boolean }> {
    return this.http.get<{ hasAccess: boolean }>(`${this.BASE}/check-access`, {
      params: { courseId: courseId.toString() }
    });
  }

  // ── Admin endpoints ───────────────────────────────────────────────────────

  getAllPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.BASE}/all`);
  }

  getPendingPayments(): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(`${this.BASE}/pending`);
  }

  approvePayment(
    paymentId: number,
    notes: string = ''
  ): Observable<PaymentResponse> {
    return this.http.put<PaymentResponse>(`${this.BASE}/${paymentId}/approve`, {
      notes
    });
  }

  rejectPayment(
    paymentId: number,
    reason: string
  ): Observable<PaymentResponse> {
    return this.http.put<PaymentResponse>(`${this.BASE}/${paymentId}/reject`, {
      reason
    });
  }

  refundPayment(paymentId: number): Observable<PaymentResponse> {
    return this.http.put<PaymentResponse>(
      `${this.BASE}/${paymentId}/refund`,
      {}
    );
  }

  getStatistics(): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(`${this.BASE}/statistics`);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Build the exact object that matches PaymentInitiateRequest on the backend.
   * Client-only fields (raw card number, expiry, CVC) are intentionally excluded.
   * cardLast4 and cardType are derived here so the backend stores them.
   */
  private buildPayload(data: PaymentRequest): Record<string, any> {
    const payload: Record<string, any> = {
      courseId: data.courseId,
      paymentMethod: data.paymentMethod
    };

    // Only include monetary fields for non-WALLET payments
    if (data.paymentMethod !== 'WALLET') {
      payload['amount'] = data.amount;
      payload['currency'] = data.currency;
    }

    if (data.couponCode?.trim()) {
      payload['couponCode'] = data.couponCode.trim().toUpperCase();
    }

    if (data.billingCountry) {
      payload['billingCountry'] = data.billingCountry;
    }

    if (data.paymentMethod === 'CREDIT_CARD') {
      payload['cardHolderName'] = data.cardHolderName;
      // Derive last4 + type from raw card number if available
      if (data.cardNumber) {
        const clean = data.cardNumber.replace(/\s/g, '');
        payload['cardLast4'] = clean.slice(-4);
        payload['cardType'] = this.detectCardType(clean);
      }
    }

    return payload;
  }

  private detectCardType(cardNumber: string): string {
    if (cardNumber.startsWith('4')) return 'VISA';
    if (cardNumber.startsWith('5')) return 'MASTERCARD';
    if (cardNumber.startsWith('3')) return 'AMEX';
    return 'UNKNOWN';
  }
}
