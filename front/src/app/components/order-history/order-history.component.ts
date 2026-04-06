import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {

  orders: Order[] = [];
  userId = 1;
  loading = false;

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.loading = true;
    this.orderService.getOrdersByUser(this.userId).subscribe({
      next: (data) => { this.orders = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  viewDetail(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'CART': return 'info';
      case 'SHIPPED': return 'warning';
      case 'DELIVERED': return 'active';
      case 'CANCELLED': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'CART': return 'Panier';
      case 'SHIPPED': return 'Expédiée';
      case 'DELIVERED': return 'Livrée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  }
}
