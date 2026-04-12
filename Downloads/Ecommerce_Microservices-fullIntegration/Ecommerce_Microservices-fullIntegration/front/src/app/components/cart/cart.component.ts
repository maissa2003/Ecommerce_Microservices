import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, Order, Country } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Order | null = null;
  userId = 1; // replace with real user id from auth later
  loading = false;
  message = '';
  error = '';

  showCheckoutForm = false;
  checkoutData = {
    nom: '',
    prenom: '',
    adresse: '',
    telephone: '',
    selectedCurrency: 'EUR',
    countryCode: '+33'
  };
  promoCodeInput = '';

  // Currency configuration
  currencies = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dollar' },
    { code: 'TND', symbol: 'DT', name: 'Dinar' }
  ];

  // Country codes for phone numbers - loaded from backend
  countries: Country[] = [];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.loadCart();
    this.loadCountries();
  }

  loadCountries(): void {
    this.orderService.getActiveCountries().subscribe({
      next: countries => {
        this.countries = countries;
      },
      error: err => {
        console.error('Failed to load countries', err);
        // Fallback to default countries if API fails
        this.countries = [
          {
            id: 1,
            code: '+216',
            flag: '🇹🇳',
            name: 'Tunisia',
            isoCode: 'TN',
            region: 'Africa',
            active: true
          },
          {
            id: 2,
            code: '+33',
            flag: '🇫🇷',
            name: 'France',
            isoCode: 'FR',
            region: 'Europe',
            active: true
          },
          {
            id: 3,
            code: '+1',
            flag: '🇺🇸',
            name: 'USA',
            isoCode: 'US',
            region: 'North America',
            active: true
          }
        ];
      }
    });
  }

  loadCart(): void {
    this.loading = true;
    this.orderService.getCart(this.userId).subscribe({
      next: data => {
        this.cart = data;
        this.error = '';
        this.loading = false;
      },
      error: err => {
        console.error('Cart load failed', err);
        this.cart = {
          id: 0,
          userId: this.userId,
          status: 'PENDING',
          items: [],
          total: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as any;
        this.error =
          'Erreur lors du chargement du panier. Vérifiez que le backend est démarré (localhost:8088).';
        this.loading = false;
      }
    });
  }

  removeItem(itemId: number): void {
    this.orderService.removeFromCart(this.userId, itemId).subscribe({
      next: data => {
        this.cart = data;
        this.error = '';
      },
      error: () => (this.error = 'Erreur lors de la suppression.')
    });
  }

  getSubTotal(): number {
    if (!this.cart?.items) return 0;
    return this.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  // Currency conversion methods
  getCurrencySymbol(): string {
    const currency = this.currencies.find(
      c => c.code === this.checkoutData.selectedCurrency
    );
    return currency ? currency.symbol : '€';
  }

  /**
   * Convert price from EUR to selected currency
   * Backend stores prices in EUR, this converts to user's selected currency
   */
  convertPrice(priceInEur: number): number {
    if (!priceInEur) return 0;

    switch (this.checkoutData.selectedCurrency) {
      case 'USD':
        return priceInEur * 1.08; // 1 EUR = 1.08 USD
      case 'TND':
        return priceInEur * 3.35; // 1 EUR = 3.35 TND
      case 'EUR':
      default:
        return priceInEur;
    }
  }

  /**
   * Get converted price for an individual item
   */
  getConvertedItemPrice(price: number): number {
    return this.convertPrice(price);
  }

  /**
   * Get converted subtotal for an item (price * quantity)
   */
  getConvertedItemSubtotal(item: any): number {
    const convertedPrice = this.convertPrice(item.price);
    return convertedPrice * item.quantity;
  }

  /**
   * Get the converted cart total
   */
  /**
   * Get the converted cart total (including discounts)
   */
  getConvertedTotal(): number {
    if (!this.cart?.items) return 0;

    // Subtotal from items
    const subtotal = this.cart.items.reduce((sum, item) => {
      return sum + this.getConvertedItemSubtotal(item);
    }, 0);

    // Discount (converted)
    const discount = this.convertPrice(this.cart.discountAmount || 0);

    return Math.max(0, subtotal - discount);
  }

  applyPromo(): void {
    if (!this.promoCodeInput.trim()) {
      this.error = 'Veuillez saisir un code promo.';
      return;
    }

    this.orderService
      .applyPromoCode(this.userId, this.promoCodeInput)
      .subscribe({
        next: updatedCart => {
          this.cart = updatedCart;
          this.message = 'Code promo appliqué !';
          this.error = '';
          setTimeout(() => (this.message = ''), 3000);
        },
        error: err => {
          console.error('Promo apply failed', err);
          this.error =
            err.error?.message || 'Erreur lors de l’application du code promo.';
          this.message = '';
        }
      });
  }

  /**
   * Legacy method - kept for compatibility but uses converted total
   */
  convertCurrency(amount: number): number {
    return this.convertPrice(amount);
  }

  getSelectedCountryFlag(): string {
    const country = this.countries.find(
      c => c.code === this.checkoutData.countryCode
    );
    return country ? country.flag : '🌍';
  }

  getDisplayedTotal(): number {
    // Prefer backend total if provided, otherwise compute from items.
    const apiTotal = this.cart?.total;
    if (typeof apiTotal === 'number' && !Number.isNaN(apiTotal))
      return apiTotal;
    return this.getSubTotal();
  }

  confirmOrder(): void {
    if (!this.cart || this.cart.items.length === 0) return;

    // Validate form if it's showing
    if (this.showCheckoutForm) {
      if (
        !this.checkoutData.nom ||
        !this.checkoutData.prenom ||
        !this.checkoutData.adresse ||
        !this.checkoutData.telephone
      ) {
        this.error =
          'Veuillez remplir tous les champs du formulaire de commande.';
        return;
      }
    }

    this.orderService.confirmOrder(this.userId, this.promoCodeInput).subscribe({
      next: confirmedOrder => {
        // Save checkout data to localStorage linked to this order ID
        if (this.showCheckoutForm) {
          localStorage.setItem(
            `order_info_${confirmedOrder.id}`,
            JSON.stringify(this.checkoutData)
          );
        }

        this.message = 'Commande confirmée avec succès !';
        this.error = '';
        this.showCheckoutForm = false; // reset form
        this.checkoutData = {
          nom: '',
          prenom: '',
          adresse: '',
          telephone: '',
          selectedCurrency: 'EUR',
          countryCode: '+33'
        };
        this.promoCodeInput = '';
        this.loadCart();
      },
      error: err => {
        this.error =
          err.error?.message ||
          'Erreur lors de la confirmation (Code Promo invalide ou expiré ?).';
      }
    });
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
