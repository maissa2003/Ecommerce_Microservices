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

  constructor(private orderService: OrderService, private router: Router) {}

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
      next: (data) => { this.cart = data; },
      error: () => this.error = 'Erreur lors de la suppression.'
    });
  }

  confirmOrder(): void {
    if (!this.cart || this.cart.items.length === 0) return;
    this.orderService.confirmOrder(this.userId).subscribe({
      next: () => {
        this.message = 'Commande confirmée avec succès !';
        this.loadCart();
      },
      error: () => this.error = 'Erreur lors de la confirmation.'
    });
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}