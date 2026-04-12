import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.orderService.getOrderById(id).subscribe({
      next: data => {
        this.order = data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmée';
      case 'CART':
        return 'Panier';
      case 'SHIPPED':
        return 'Expédiée';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'CART':
        return 'info';
      case 'SHIPPED':
        return 'warning';
      case 'DELIVERED':
        return 'active';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'info';
    }
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
