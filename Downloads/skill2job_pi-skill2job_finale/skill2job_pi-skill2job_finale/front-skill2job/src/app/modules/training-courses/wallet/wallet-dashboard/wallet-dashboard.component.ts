import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  WalletService,
  Wallet,
  WalletTransaction,
  SpinHistory
} from '../services/wallet.service';

@Component({
  selector: 'app-wallet-dashboard',
  templateUrl: './wallet-dashboard.component.html',
  styleUrls: ['./wallet-dashboard.component.scss']
})
export class WalletDashboardComponent implements OnInit {
  wallet: Wallet | null = null;
  transactions: WalletTransaction[] = [];
  spinHistory: SpinHistory[] = [];

  balance: number = 0;
  canSpin: boolean = false;

  // ✅ Roue de la chance
  isSpinning: boolean = false;
  showSpinModal: boolean = false;
  pointsWon: number = 0;
  spinMessage: string = '';

  wheelRotation: number = 0;

  constructor(private walletService: WalletService, private router: Router) {}

  ngOnInit(): void {
    this.loadWalletData();
    this.loadTransactions();
    this.loadSpinHistory();
    this.checkCanSpin();
  }

  loadWalletData(): void {
    this.walletService.getMyWallet().subscribe({
      next: (wallet: Wallet) => {
        this.wallet = wallet;
        this.balance = wallet.balance;
      },
      error: (err: any) => {
        console.error('Error loading wallet:', err);
      }
    });
  }

  loadTransactions(): void {
    this.walletService.getTransactions().subscribe({
      next: (transactions: WalletTransaction[]) => {
        this.transactions = transactions;
      },
      error: (err: any) => {
        console.error('Error loading transactions:', err);
      }
    });
  }

  loadSpinHistory(): void {
    this.walletService.getSpinHistory().subscribe({
      next: (history: SpinHistory[]) => {
        this.spinHistory = history;
      },
      error: (err: any) => {
        console.error('Error loading spin history:', err);
      }
    });
  }

  checkCanSpin(): void {
    this.walletService.canSpinToday().subscribe({
      next: (data: { canSpin: boolean }) => {
        this.canSpin = data.canSpin;
      },
      error: (err: any) => {
        console.error('Error checking spin:', err);
      }
    });
  }

  spinTheWheel(): void {
    if (!this.canSpin || this.isSpinning) return;

    this.isSpinning = true;

    // Animation de rotation
    const spins = 5 + Math.random() * 3; // 5-8 tours
    const extraDegrees = Math.random() * 360; // Position finale aléatoire
    this.wheelRotation = spins * 360 + extraDegrees;

    // Appel API après 3 secondes (durée de l'animation)
    setTimeout(() => {
      this.walletService.spinWheel().subscribe({
        next: (result: any) => {
          this.pointsWon = result.pointsWon;
          this.spinMessage = result.message;
          this.showSpinModal = true;
          this.canSpin = false;
          this.isSpinning = false;

          // Reload data
          this.loadWalletData();
          this.loadTransactions();
          this.loadSpinHistory();
        },
        error: (err: any) => {
          alert(err.error?.error || 'Already spun today!');
          this.isSpinning = false;
          this.canSpin = false;
        }
      });
    }, 3000);
  }

  closeSpinModal(): void {
    this.showSpinModal = false;
    this.wheelRotation = 0;
  }

  getTransactionIcon(type: string): string {
    const icons: any = {
      CREDIT: '💰',
      DEBIT: '💸',
      WELCOME_BONUS: '🎁',
      REFUND: '↩️',
      PAYMENT: '💳'
    };
    return icons[type] || '📝';
  }

  getTransactionColor(type: string): string {
    return ['CREDIT', 'WELCOME_BONUS', 'REFUND'].includes(type)
      ? 'positive'
      : 'negative';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/user/courses']);
  }
}
