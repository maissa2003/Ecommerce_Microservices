import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PaymentService, PaymentRequest } from './services/payment.service';
import { WalletService } from '../wallet/services/wallet.service';
import { AuthService } from '../../services/auth.service';
import { TrainingCourseService } from '../services/training-course.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  courseId: number = 0;
  originalPrice: number = 0;
  discount: number = 0;
  basePrice: number = 0; // price after 76% promo, before coupon
  finalPrice: number = 0; // price shown to user / sent to backend
  currency: string = 'USD';
  course: any = null;

  billingCountry: string = 'Tunisia';
  selectedMethod: 'CREDIT_CARD' | 'WALLET' | 'BANK_TRANSFER' = 'CREDIT_CARD';

  cardNumber: string = '';
  cardExpiry: string = '';
  cardCVC: string = '';
  cardHolderName: string = '';

  walletBalance: number = 0;

  couponCode: string = '';
  couponApplied: boolean = false;
  couponLoading: boolean = false;
  couponError: string = '';
  couponSuccess: string = '';
  couponDiscount: number = 0;

  isSubmitting: boolean = false;
  errorMessage: string = '';
  showSuccessModal: boolean = false;
  transactionId: string = '';

  countries = [
    'Tunisia',
    'France',
    'Algeria',
    'Morocco',
    'Belgium',
    'Switzerland',
    'Canada',
    'United States',
    'Other'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private paymentService: PaymentService,
    private walletService: WalletService,
    private authService: AuthService,
    private courseService: TrainingCourseService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      this.courseId = +params['courseId'] || 0;
      this.originalPrice = +params['amount'] || 0;
      this.currency = params['currency'] || 'USD';

      this.discount = this.originalPrice * 0.76;
      this.basePrice = +(this.originalPrice - this.discount).toFixed(2);
      this.finalPrice = this.basePrice;

      this.loadCourseDetails();
      this.loadWalletBalance();
    });
  }

  loadCourseDetails(): void {
    if (!this.courseId) return;
    this.courseService.getAll().subscribe((courses: any[]) => {
      this.course =
        (courses || []).find((c: any) => c.id === this.courseId) || null;
    });
  }

  loadWalletBalance(): void {
    this.walletService.getBalance().subscribe({
      next: (data: any) => {
        this.walletBalance = data.balance || 0;
      },
      error: () => {
        this.walletBalance = 0;
      }
    });
  }

  selectMethod(method: 'CREDIT_CARD' | 'WALLET' | 'BANK_TRANSFER'): void {
    this.selectedMethod = method;
    this.errorMessage = '';
  }

  // ══════════════════════════════════════════════════════════════
  // COUPON
  // ══════════════════════════════════════════════════════════════

  applyCoupon(): void {
    const code = this.couponCode.trim().toUpperCase();
    if (!code) {
      this.couponError = 'Please enter a coupon code.';
      return;
    }

    this.couponLoading = true;
    this.couponError = '';
    this.couponSuccess = '';

    this.http
      .get<{ valid: boolean; discountPercentage: number; code: string }>(
        `${environment.apiUrl}/coupons/validate?code=${encodeURIComponent(
          code
        )}`
      )
      .subscribe({
        next: res => {
          this.couponApplied = true;
          this.couponDiscount = res.discountPercentage;
          this.couponCode = res.code;

          // Apply coupon % on top of the already-discounted base price
          this.finalPrice = +(
            this.basePrice *
            (1 - res.discountPercentage / 100)
          ).toFixed(2);
          this.couponSuccess = `✓ ${res.discountPercentage}% off applied!`;
          this.couponError = '';
          this.couponLoading = false;
        },
        error: (err: any) => {
          this.couponLoading = false;
          this.couponError = err?.error?.error || 'Invalid or expired coupon.';
          this.couponApplied = false;
          this.couponDiscount = 0;
        }
      });
  }

  removeCoupon(): void {
    this.couponCode = '';
    this.couponApplied = false;
    this.couponError = '';
    this.couponSuccess = '';
    this.couponDiscount = 0;
    this.finalPrice = this.basePrice;
  }

  // ══════════════════════════════════════════════════════════════
  // CARD FORMATTING
  // ══════════════════════════════════════════════════════════════

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, '').replace(/\D/g, '');
    if (value.length > 16) value = value.substring(0, 16);
    this.cardNumber = value.match(/.{1,4}/g)?.join(' ') || value;
  }

  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.cardExpiry = value;
  }

  formatCVC(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 3) value = value.substring(0, 3);
    this.cardCVC = value;
  }

  // ══════════════════════════════════════════════════════════════
  // VALIDATION
  // ══════════════════════════════════════════════════════════════

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.billingCountry) {
      this.errorMessage = 'Country is required.';
      return false;
    }

    // ✅ Validation CREDIT_CARD
    if (this.selectedMethod === 'CREDIT_CARD') {
      if (!this.cardNumber.trim()) {
        this.errorMessage = 'Card number is required.';
        return false;
      }

      const clean = this.cardNumber.replace(/\s/g, '');
      if (clean.length < 13 || clean.length > 16) {
        this.errorMessage = 'Invalid card number.';
        return false;
      }

      if (!this.cardExpiry.trim()) {
        this.errorMessage = 'Expiry date is required.';
        return false;
      }

      if (!this.cardCVC.trim() || this.cardCVC.length !== 3) {
        this.errorMessage = 'Invalid CVC.';
        return false;
      }

      if (!this.cardHolderName.trim()) {
        this.errorMessage = 'Cardholder name is required.';
        return false;
      }
    }

    // ✅ Validation WALLET (avec prix en points)
    if (this.selectedMethod === 'WALLET') {
      // Vérifier si le cours a un prix en points
      if (!this.course?.pointsPrice || this.course.pointsPrice <= 0) {
        this.errorMessage = 'This course is not available for wallet payment.';
        return false;
      }

      // Vérifier si le solde est suffisant
      if (this.walletBalance < this.course.pointsPrice) {
        this.errorMessage = `Insufficient balance. You need ${this.course.pointsPrice.toFixed(
          0
        )} points but have ${this.walletBalance.toFixed(0)} points.`;
        return false;
      }
    }

    return true;
  }

  // ══════════════════════════════════════════════════════════════
  // SUBMIT PAYMENT
  // ══════════════════════════════════════════════════════════════

  submitPayment(): void {
    if (!this.validateForm()) return;

    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'Not authenticated.';
      this.router.navigate(['/signin']);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const paymentData: PaymentRequest = {
      courseId: this.courseId,
      paymentMethod: this.selectedMethod,
      billingCountry: this.billingCountry,

      // ✅ Pour CREDIT_CARD et BANK_TRANSFER: envoyer amount + currency
      ...(this.selectedMethod !== 'WALLET' && {
        amount: this.originalPrice,
        currency: this.currency
      }),

      // ✅ Ajouter coupon si appliqué
      ...(this.couponApplied &&
        this.couponCode.trim() && {
          couponCode: this.couponCode.trim().toUpperCase()
        }),

      // ✅ Pour CREDIT_CARD: ajouter détails carte
      ...(this.selectedMethod === 'CREDIT_CARD' && {
        cardNumber: this.cardNumber.replace(/\s/g, ''),
        cardHolderName: this.cardHolderName,
        cardExpiry: this.cardExpiry,
        cardCVC: this.cardCVC
      })
    };

    this.paymentService.initiatePayment(paymentData).subscribe({
      next: (payment: any) => {
        console.log('✅ Payment successful:', payment);
        this.transactionId = payment.transactionId;
        this.isSubmitting = false;
        this.showSuccessModal = true;

        // Rediriger après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/user/courses']);
        }, 3000);
      },
      error: (err: any) => {
        console.error('❌ Payment error:', err);

        const msg =
          err?.error?.error ||
          err?.error?.message ||
          'Payment failed. Please try again.';

        // Si l'erreur concerne le coupon, la traiter séparément
        if (msg.toLowerCase().includes('coupon')) {
          this.couponError = msg;
          this.couponApplied = false;
          this.finalPrice = this.basePrice;
        } else {
          this.errorMessage = msg;
        }

        this.isSubmitting = false;
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════

  getCurrencySymbol(): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      TND: 'DT'
    };
    return symbols[this.currency] || this.currency;
  }

  cancel(): void {
    this.router.navigate(['/user/courses']);
  }

  // ✅ NOUVEAU: Helper pour vérifier si le wallet est disponible pour ce cours
  isWalletAvailable(): boolean {
    return this.course?.pointsPrice && this.course.pointsPrice > 0;
  }

  // ✅ NOUVEAU: Obtenir le prix en points du cours
  getPointsPrice(): number {
    return this.course?.pointsPrice || 0;
  }
}
