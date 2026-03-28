import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService, Order as ApiOrder } from '../../services/order.service';

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

interface AdminOrder {
  id: string;
  apiId?: number;
  customer: string;
  email: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing' | 'cancelled';
  date: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  status: 'active' | 'inactive';
}

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  type: 'sale' | 'user' | 'product';
}

// Ajout de l'interface Customer
interface Customer {
  name: string;
  email: string;
  orders: number;
  total: number;
  date: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // États
  isSidebarCollapsed = false;
  activeTab = 'overview';
  isAddProductModalOpen = false;
  isEditProductModalOpen = false;
  selectedProduct: any = null;
  
  // Order modal states
  isViewOrderModalOpen = false;
  isEditOrderModalOpen = false;
  selectedOrder: ApiOrder | null = null;

  apiOrders: ApiOrder[] = [];
  
  // Formulaires
  productForm: FormGroup;
  orderForm: FormGroup;
  
  // Loading state
  isLoadingOrders = false;
  orderError: string | null = null;
  
  // Données
  statCards: StatCard[] = [
    {
      title: 'Chiffre d\'affaires',
      value: '€45,231',
      change: '+20.1%',
      trend: 'up',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'primary'
    },
    {
      title: 'Commandes',
      value: '2,356',
      change: '+12.5%',
      trend: 'up',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'success'
    },
    {
      title: 'Clients',
      value: '12,345',
      change: '+18.2%',
      trend: 'up',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      color: 'warning'
    },
    {
      title: 'Produits',
      value: '548',
      change: '+5.4%',
      trend: 'up',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'info'
    }
  ];

  orders: AdminOrder[] = [
    {
      id: '#ORD-001',
      apiId: 1,
      customer: 'Sophie Martin',
      email: 'sophie@email.com',
      amount: 299,
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: '#ORD-002',
      apiId: 2,
      customer: 'Thomas Dubois',
      email: 'thomas@email.com',
      amount: 129,
      status: 'processing',
      date: '2024-01-14'
    },
    {
      id: '#ORD-003',
      apiId: 3,
      customer: 'Marie Laurent',
      email: 'marie@email.com',
      amount: 79,
      status: 'pending',
      date: '2024-01-14'
    },
    {
      id: '#ORD-004',
      apiId: 4,
      customer: 'Jean Dupont',
      email: 'jean@email.com',
      amount: 199,
      status: 'completed',
      date: '2024-01-13'
    },
    {
      id: '#ORD-005',
      apiId: 5,
      customer: 'Claire Bernard',
      email: 'claire@email.com',
      amount: 399,
      status: 'cancelled',
      date: '2024-01-12'
    }
  ];

  products: Product[] = [
    {
      id: 1,
      name: 'Smartwatch Pro',
      price: 299,
      stock: 45,
      category: 'Électronique',
      status: 'active'
    },
    {
      id: 2,
      name: 'Écouteurs Sans Fil',
      price: 129,
      stock: 120,
      category: 'Audio',
      status: 'active'
    },
    {
      id: 3,
      name: 'Sac à Dos Urbain',
      price: 79,
      stock: 34,
      category: 'Accessoires',
      status: 'active'
    },
    {
      id: 4,
      name: 'Montre Classique',
      price: 199,
      stock: 12,
      category: 'Accessoires',
      status: 'inactive'
    }
  ];

  recentActivities: RecentActivity[] = [
    {
      id: 1,
      user: 'Sophie Martin',
      action: 'a passé une commande de €299',
      time: 'il y a 5 minutes',
      type: 'sale'
    },
    {
      id: 2,
      user: 'Thomas Dubois',
      action: 's\'est inscrit sur la plateforme',
      time: 'il y a 1 heure',
      type: 'user'
    },
    {
      id: 3,
      user: 'Admin',
      action: 'a ajouté le produit "Smartwatch Pro"',
      time: 'il y a 3 heures',
      type: 'product'
    },
    {
      id: 4,
      user: 'Marie Laurent',
      action: 'a passé une commande de €79',
      time: 'il y a 5 heures',
      type: 'sale'
    }
  ];

  // Ajout de la propriété customers
  customers: Customer[] = [
    {
      name: 'Sophie Martin',
      email: 'sophie.martin@email.com',
      orders: 12,
      total: 2847,
      date: '2023-01-15'
    },
    {
      name: 'Thomas Dubois',
      email: 'thomas.dubois@email.com',
      orders: 8,
      total: 1259,
      date: '2023-02-20'
    },
    {
      name: 'Marie Laurent',
      email: 'marie.laurent@email.com',
      orders: 15,
      total: 3478,
      date: '2022-11-10'
    },
    {
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      orders: 5,
      total: 899,
      date: '2023-03-05'
    },
    {
      name: 'Claire Bernard',
      email: 'claire.bernard@email.com',
      orders: 20,
      total: 5249,
      date: '2022-09-18'
    },
    {
      name: 'Lucas Moreau',
      email: 'lucas.moreau@email.com',
      orders: 3,
      total: 449,
      date: '2023-04-12'
    },
    {
      name: 'Emma Petit',
      email: 'emma.petit@email.com',
      orders: 9,
      total: 1899,
      date: '2023-01-25'
    },
    {
      name: 'Hugo Robert',
      email: 'hugo.robert@email.com',
      orders: 14,
      total: 3299,
      date: '2022-12-03'
    }
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private orderService: OrderService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      status: ['active', [Validators.required]]
    });

    this.orderForm = this.fb.group({
      status: ['', [Validators.required]]
    });
  }

ngOnInit(): void {
  // TEMPORAIRE : Désactiver la vérification d'authentification pour le test
  // const isAdmin = localStorage.getItem('isAdmin');
  // if (!isAdmin) {
  //   // Rediriger vers la page de connexion
  //   this.router.navigate(['/signin']);
  // }
  
  // Pour le test, définir manuellement le statut admin
  localStorage.setItem('isAdmin', 'true');
  localStorage.setItem('authToken', 'demo-token');
  console.log('Mode démo - Interface admin accessible sans connexion');
  
  // Load orders from the backend
  this.loadOrders();
}

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    console.log('Active tab changed to:', tab);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    this.router.navigate(['/']);
  }

  // Gestion des produits
  openAddProductModal(): void {
    this.isAddProductModalOpen = true;
    this.productForm.reset({ status: 'active' });
  }

  closeAddProductModal(): void {
    this.isAddProductModalOpen = false;
  }

  openEditProductModal(product: Product): void {
    this.selectedProduct = product;
    this.isEditProductModalOpen = true;
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      status: product.status
    });
  }

  closeEditProductModal(): void {
    this.isEditProductModalOpen = false;
    this.selectedProduct = null;
  }

  addProduct(): void {
    if (this.productForm.valid) {
      const newProduct: Product = {
        id: this.products.length + 1,
        name: this.productForm.value.name,
        price: this.productForm.value.price,
        stock: this.productForm.value.stock,
        category: this.productForm.value.category,
        status: this.productForm.value.status
      };
      this.products.push(newProduct);
      this.closeAddProductModal();
    }
  }

  updateProduct(): void {
    if (this.productForm.valid && this.selectedProduct) {
      const index = this.products.findIndex(p => p.id === this.selectedProduct.id);
      if (index !== -1) {
        this.products[index] = {
          ...this.products[index],
          name: this.productForm.value.name,
          price: this.productForm.value.price,
          stock: this.productForm.value.stock,
          category: this.productForm.value.category,
          status: this.productForm.value.status
        };
      }
      this.closeEditProductModal();
    }
  }

  deleteProduct(productId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.products = this.products.filter(p => p.id !== productId);
    }
  }

  // Gestion des commandes
  loadOrders(): void {
    this.isLoadingOrders = true;
    this.orderError = null;
    
    // Try to load all orders from the API
    this.orderService.getAllOrders().subscribe({
      next: (data: ApiOrder[]) => {
        this.apiOrders = data;
        this.orders = data.map((apiOrder: ApiOrder) => ({
          id: `#ORD-${apiOrder.id}`,
          apiId: apiOrder.id,
          customer: `Utilisateur ${apiOrder.userId}`,
          email: `user${apiOrder.userId}@example.com`,
          amount: apiOrder.total ?? apiOrder.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0,
          status: apiOrder.status as 'completed' | 'processing' | 'pending' | 'cancelled',
          date: new Date(apiOrder.createdAt).toISOString().split('T')[0]
        }));
        console.log('Orders loaded from API:', this.orders);
        this.isLoadingOrders = false;
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
        this.orderError = 'Failed to load orders from server. Using demo data.';
        this.isLoadingOrders = false;
        // Keep the default mock data if API fails
      }
    });
  }

  deleteOrder(orderId: string | number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      const id = typeof orderId === 'string' ? parseInt(orderId.replace('#ORD-', '')) : orderId;
      
      this.orderService.cancelOrder(id).subscribe({
        next: () => {
          this.apiOrders = this.apiOrders.filter((o: ApiOrder) => o.id !== id);
          this.orders = this.orders.filter((o: AdminOrder) => o.apiId !== id);
          console.log(`Commande ${orderId} supprimée`);
          alert('Commande supprimée avec succès!');
        },
        error: (error: any) => {
          console.error('Error deleting order:', error);
          // Also remove from local list for demo
          this.apiOrders = this.apiOrders.filter((o: ApiOrder) => o.id !== id);
          this.orders = this.orders.filter((o: AdminOrder) => o.apiId !== id);
          alert('Commande supprimée');
        }
      });
    }
  }

  editOrderStatus(orderId: string | number): void {
    const id = typeof orderId === 'string' ? parseInt(orderId.replace('#ORD-', '')) : orderId;
    const apiOrder = this.apiOrders.find(o => o.id === id);
    if (!apiOrder) return;

    this.selectedOrder = apiOrder;
    this.isEditOrderModalOpen = true;
    this.orderForm.patchValue({
      status: apiOrder.status
    });
  }

  updateOrderStatus(): void {
    if (!this.selectedOrder || !this.orderForm.valid) return;

    const newStatus = this.orderForm.value.status;
    const orderId = this.selectedOrder.id;

    this.orderService.updateStatus(orderId, newStatus).subscribe({
      next: (updatedOrder) => {
        const apiIndex = this.apiOrders.findIndex(o => o.id === orderId);
        if (apiIndex !== -1) {
          this.apiOrders[apiIndex] = updatedOrder;
        }

        const uiIndex = this.orders.findIndex(o => o.apiId === orderId);
        if (uiIndex !== -1) {
          this.orders[uiIndex].status = updatedOrder.status as 'completed' | 'processing' | 'pending' | 'cancelled';
        }

        this.closeEditOrderModal();
        alert('Statut de la commande mis à jour avec succès!');
      },
      error: (error: any) => {
        console.error('Error updating order status:', error);
        // Update locally for demo
        const uiIndex = this.orders.findIndex(o => o.apiId === this.selectedOrder?.id);
        if (uiIndex !== -1 && this.selectedOrder) {
          this.orders[uiIndex].status = newStatus as 'completed' | 'processing' | 'pending' | 'cancelled';
        }
        this.closeEditOrderModal();
        alert('Statut de la commande mis à jour');
      }
    });
  }

  viewOrderDetails(orderId: string | number): void {
    const id = typeof orderId === 'string' ? parseInt(orderId.replace('#ORD-', '')) : orderId;
    const apiOrder = this.apiOrders.find(o => o.id === id);
    if (!apiOrder) return;

    this.selectedOrder = apiOrder;
    this.isViewOrderModalOpen = true;
  }

  openAddOrderModal(): void {
    if (confirm('Cette fonctionnalité nécessite une connexion à la page de création de commande. Rediriger vers le panier admin ?')) {
      this.router.navigate(['/admin/cart']);
    }
  }

  closeViewOrderModal(): void {
    this.isViewOrderModalOpen = false;
    this.selectedOrder = null;
  }

  closeEditOrderModal(): void {
    this.isEditOrderModalOpen = false;
    this.selectedOrder = null;
    this.orderForm.reset();
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'pending': return 'info';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'completed': return 'Terminée';
      case 'processing': return 'En cours';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  }
}