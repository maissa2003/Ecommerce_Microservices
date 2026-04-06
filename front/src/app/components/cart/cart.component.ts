import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

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
    telephone: ''
  };
  promoCodeInput = '';

  constructor(private orderService: OrderService, private router: Router) { }

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.orderService.getCart(this.userId).subscribe({
      next: (data) => {
        this.cart = data;
        this.error = '';
        this.loading = false;
      },
      error: (err) => {
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
        this.error = 'Erreur lors du chargement du panier. Vérifiez que le backend est démarré (localhost:8080).';
        this.loading = false;
      }
    });
  }

  removeItem(itemId: number): void {
    this.orderService.removeFromCart(this.userId, itemId).subscribe({
      next: (data) => { this.cart = data; this.error = ''; },
      error: () => this.error = 'Erreur lors de la suppression.'
    });
  }

  getSubTotal(): number {
    if (!this.cart?.items) return 0;
    return this.cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  }

  getDisplayedTotal(): number {
    // Prefer backend total if provided, otherwise compute from items.
    const apiTotal = this.cart?.total;
    if (typeof apiTotal === 'number' && !Number.isNaN(apiTotal)) return apiTotal;
    return this.getSubTotal();
  }

  confirmOrder(): void {
    if (!this.cart || this.cart.items.length === 0) return;

    // Validate form if it's showing
    if (this.showCheckoutForm) {
      if (!this.checkoutData.nom || !this.checkoutData.prenom || !this.checkoutData.adresse || !this.checkoutData.telephone) {
        this.error = 'Veuillez remplir tous les champs du formulaire de commande.';
        return;
      }
    }

    this.orderService.confirmOrder(this.userId, this.promoCodeInput).subscribe({
      next: (confirmedOrder) => {
        // Save checkout data to localStorage linked to this order ID
        if (this.showCheckoutForm) {
          localStorage.setItem(`order_info_${confirmedOrder.id}`, JSON.stringify(this.checkoutData));
        }

        this.message = 'Commande confirmée avec succès !';
        this.error = '';
        this.showCheckoutForm = false; // reset form
        this.checkoutData = { nom: '', prenom: '', adresse: '', telephone: '' };
        this.promoCodeInput = '';
        this.loadCart();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la confirmation (Code Promo invalide ou expiré ?).';
      }
    });
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}