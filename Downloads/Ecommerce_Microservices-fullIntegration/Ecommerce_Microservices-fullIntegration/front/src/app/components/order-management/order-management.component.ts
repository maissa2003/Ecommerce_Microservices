import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  OrderService,
  Order as ApiOrder,
  OrderItem
} from '../../services/order.service';

interface AdminOrder {
  id: string;
  apiId?: number;
  customer: string;
  email: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing' | 'cancelled';
  date: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.css'
})
export class OrderManagementComponent implements OnInit {
  orders: AdminOrder[] = [];
  isAddOrderModalOpen = false;
  isEditOrderModalOpen = false;
  selectedOrder: AdminOrder | null = null;

  orderForm: FormGroup;
  itemForm: FormGroup;

  currentOrderItems: OrderItem[] = [];

  constructor(private fb: FormBuilder, private orderService: OrderService) {
    this.orderForm = this.fb.group({
      customer: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      status: ['pending', [Validators.required]]
    });

    this.itemForm = this.fb.group({
      articleId: ['', [Validators.required, Validators.min(1)]],
      articleName: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    // Load existing orders if any
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (data: ApiOrder[]) => {
        this.orders = data.map((apiOrder: ApiOrder) => ({
          id: `ORD-${apiOrder.id}`,
          apiId: apiOrder.id,
          customer: `Utilisateur ${apiOrder.userId}`,
          email: `user${apiOrder.userId}@example.com`,
          amount:
            apiOrder.total ??
            apiOrder.items?.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            ) ??
            0,
          status: apiOrder.status as
            | 'completed'
            | 'processing'
            | 'pending'
            | 'cancelled',
          date: new Date(apiOrder.createdAt).toISOString().split('T')[0],
          items: apiOrder.items || []
        }));
      },
      error: error => {
        console.error('Error loading orders:', error);
        // Keep orders empty if API fails
      }
    });
  }

  openAddOrderModal(): void {
    this.isAddOrderModalOpen = true;
    this.currentOrderItems = [];
    this.orderForm.reset({ status: 'pending' });
  }

  closeAddOrderModal(): void {
    this.isAddOrderModalOpen = false;
    this.currentOrderItems = [];
    this.orderForm.reset();
  }

  openEditOrderModal(order: AdminOrder): void {
    this.selectedOrder = order;
    this.isEditOrderModalOpen = true;
    this.currentOrderItems = [...order.items];
    this.orderForm.patchValue({
      customer: order.customer,
      email: order.email,
      status: order.status
    });
  }

  closeEditOrderModal(): void {
    this.isEditOrderModalOpen = false;
    this.selectedOrder = null;
    this.currentOrderItems = [];
    this.orderForm.reset();
  }

  addItemToOrder(): void {
    if (this.itemForm.valid) {
      const newItem: OrderItem = {
        id: Date.now(), // Temporary ID for UI
        articleId: this.itemForm.value.articleId,
        articleName: this.itemForm.value.articleName,
        price: this.itemForm.value.price,
        quantity: this.itemForm.value.quantity
      };
      this.currentOrderItems.push(newItem);
      this.itemForm.reset();
    }
  }

  removeItemFromOrder(index: number): void {
    this.currentOrderItems.splice(index, 1);
  }

  createOrder(): void {
    if (this.orderForm.valid && this.currentOrderItems.length > 0) {
      const total = this.currentOrderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // For demo purposes, create a mock order since we don't have a real create API
      const newOrder: AdminOrder = {
        id: `ORD-${Date.now()}`,
        customer: this.orderForm.value.customer,
        email: this.orderForm.value.email,
        amount: total,
        status: this.orderForm.value.status,
        date: new Date().toISOString().split('T')[0],
        items: this.currentOrderItems
      };

      this.orders.push(newOrder);
      this.closeAddOrderModal();
      alert('Commande créée avec succès!');
    } else {
      alert('Veuillez remplir tous les champs et ajouter au moins un article.');
    }
  }

  updateOrder(): void {
    if (
      this.orderForm.valid &&
      this.selectedOrder &&
      this.currentOrderItems.length > 0
    ) {
      const total = this.currentOrderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const index = this.orders.findIndex(o => o.id === this.selectedOrder!.id);
      if (index !== -1) {
        this.orders[index] = {
          ...this.selectedOrder,
          customer: this.orderForm.value.customer,
          email: this.orderForm.value.email,
          amount: total,
          status: this.orderForm.value.status,
          items: this.currentOrderItems
        };

        // If it has an API ID, try to update via API
        if (this.selectedOrder.apiId) {
          this.orderService
            .updateStatus(this.selectedOrder.apiId, this.orderForm.value.status)
            .subscribe({
              next: () => console.log('Order status updated via API'),
              error: error =>
                console.error('Error updating order status:', error)
            });
        }
      }

      this.closeEditOrderModal();
      alert('Commande mise à jour avec succès!');
    } else {
      alert('Veuillez remplir tous les champs et ajouter au moins un article.');
    }
  }

  deleteOrder(order: AdminOrder): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      // If it has an API ID, try to delete via API
      if (order.apiId) {
        this.orderService.cancelOrder(order.apiId).subscribe({
          next: () => {
            this.orders = this.orders.filter(o => o.id !== order.id);
            alert('Commande supprimée avec succès!');
          },
          error: error => {
            console.error('Error deleting order:', error);
            // Remove from local list anyway
            this.orders = this.orders.filter(o => o.id !== order.id);
            alert('Commande supprimée localement');
          }
        });
      } else {
        // Remove from local list
        this.orders = this.orders.filter(o => o.id !== order.id);
        alert('Commande supprimée!');
      }
    }
  }

  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'CONFIRMED':
      case 'DELIVERED':
        return 'success';
      case 'PROCESSING':
      case 'SHIPPED':
        return 'warning';
      case 'PENDING':
      case 'CART':
        return 'info';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toUpperCase()) {
      case 'CART':
        return 'Panier';
      case 'CONFIRMED':
        return 'Confirmée';
      case 'SHIPPED':
        return 'Expédiée';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      case 'COMPLETED':
        return 'Terminée';
      case 'PROCESSING':
        return 'En cours';
      case 'PENDING':
        return 'En attente';
      default:
        return status;
    }
  }
}
