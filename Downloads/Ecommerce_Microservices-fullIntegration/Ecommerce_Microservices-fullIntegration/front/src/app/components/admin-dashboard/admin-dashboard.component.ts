import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService, Order as ApiOrder } from '../../services/order.service';
import { CategoryService, Category } from '../../services/category.service';
import { ArticleService, Article } from '../../services/article.service';
import { PromoCodeService, PromoCode } from '../../services/promo-code.service';
import { UserService, Utilisateur } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

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
  status: string;
  date: string;
  address?: string;
  phone?: string;
}

interface Customer {
  name: string;
  email: string;
  orders: number;
  total: number;
  date: string;
}

interface AdminCategory {
  id?: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  isSidebarCollapsed = false;
  activeTab = 'overview';

  // Product modal states
  isAddProductModalOpen = false;
  isEditProductModalOpen = false;
  selectedProduct: Article | null = null;
  imagePreviewAdd: string | null = null;
  imagePreviewEdit: string | null = null;
  isUploadingImage = false;

  // Order modal states
  isViewOrderModalOpen = false;
  isEditOrderModalOpen = false;
  isAddOrderModalOpen = false;
  selectedOrder: ApiOrder | null = null;

  // Data
  products: Article[] = [];
  apiOrders: ApiOrder[] = [];
  orders: AdminOrder[] = [];
  orderSearchTerm = '';

  // Loading states
  isLoadingProducts = false;
  isLoadingOrders = false;
  orderError: string | null = null;
  _editingLocalOrderId: string | null = null;
  newOrderAmount = 0;
  editOrderAmount = 0;

  // User management
  users: Utilisateur[] = [];
  filteredUsers: Utilisateur[] = [];
  isLoadingUsers = false;
  searchTermUsers = '';
  isAddUserModalOpen = false;
  isEditUserModalOpen = false;
  selectedUser: Utilisateur | null = null;
  userMessage = '';
  userError = '';

  // Forms
  productForm: FormGroup;
  orderForm: FormGroup;
  userForm: FormGroup;

  // Category properties
  categories: AdminCategory[] = [];
  selectedCategory: AdminCategory = { name: '', description: '' };
  isEditingCategory = false;
  categoryError: string | null = null;
  categorySuccess: string | null = null;

  // Promo properties
  promoCodes: PromoCode[] = [];
  selectedPromoCode: PromoCode = {
    code: '',
    discountType: 'PERCENTAGE',
    value: 0,
    expiryDate: '',
    maxUsages: 100,
    active: true
  };
  isEditingPromo = false;
  promoError: string | null = null;
  promoSuccess: string | null = null;

  statCards: StatCard[] = [
    {
      title: "Chiffre d'affaires",
      value: '€45,231',
      change: '+20.1%',
      trend: 'up',
      icon:
        'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'primary'
    },
    {
      title: 'Commandes',
      value: '2,356',
      change: '+12.5%',
      trend: 'up',
      icon:
        'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'success'
    },
    {
      title: 'Clients',
      value: '12,345',
      change: '+18.2%',
      trend: 'up',
      icon:
        'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
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
    private orderService: OrderService,
    private categoryService: CategoryService,
    private articleService: ArticleService,
    private promoCodeService: PromoCodeService,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      // ← categoryId (number) au lieu de category (string)
      categoryId: ['', Validators.required],
      image: ['', Validators.required],
      stock: ['', [Validators.required, Validators.min(0)]],
      brand: ['', Validators.required],
      rating: [0],
      reviews: [0]
    });

    this.orderForm = this.fb.group({
      customer: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      status: ['pending', Validators.required]
    });

    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['CUSTOMER', Validators.required]
    });
  }

  ngOnInit(): void {
    if (!localStorage.getItem('authToken') && !this.authService.isAdmin()) {
      this.router.navigate(['/signin']);
      return;
    }

    this.loadProducts();
    this.loadCategories();
    this.loadUsers();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'orders') this.loadOrders();
    if (tab === 'promos') this.loadPromos();
    if (tab === 'customers') this.loadUsers();
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    this.router.navigate(['/']);
  }

  // ===== PRODUCTS (ArticleService) =====

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.articleService.getAllArticles().subscribe({
      next: data => {
        this.products = data;
        this.isLoadingProducts = false;
      },
      error: err => {
        console.error('Erreur chargement articles:', err);
        this.isLoadingProducts = false;
      }
    });
  }

  openAddProductModal(): void {
    this.isAddProductModalOpen = true;
    this.imagePreviewAdd = null;
    this.productForm.reset({ rating: 0, reviews: 0 });
  }

  closeAddProductModal(): void {
    this.isAddProductModalOpen = false;
  }

  openEditProductModal(product: Article): void {
    this.selectedProduct = product;
    this.isEditProductModalOpen = true;
    this.imagePreviewEdit = product.image || null;

    // Retrouver la catégorie correspondante par nom pour préremplir le select
    const matchedCategory = this.categories.find(
      c => c.name === product.category
    );

    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      description: product.description,
      categoryId: matchedCategory?.id ?? '',
      image: product.image,
      stock: product.stock,
      brand: product.brand,
      rating: product.rating,
      reviews: product.reviews
    });
  }

  closeEditProductModal(): void {
    this.isEditProductModalOpen = false;
    this.selectedProduct = null;
    this.imagePreviewEdit = null;
  }

  onImageFileSelected(event: Event, mode: 'add' | 'edit'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = e => {
      if (mode === 'add') {
        this.imagePreviewAdd = e.target?.result as string;
      } else {
        this.imagePreviewEdit = e.target?.result as string;
      }
    };
    reader.readAsDataURL(file);

    this.isUploadingImage = true;
    this.articleService.uploadImage(file).subscribe({
      next: url => {
        this.productForm.patchValue({ image: url });
        this.isUploadingImage = false;
      },
      error: err => {
        console.error('Image upload failed:', err);
        this.isUploadingImage = false;
        alert(
          "Erreur lors du téléchargement de l'image. Vérifiez que le serveur est bien démarré."
        );
      }
    });
  }

  addProduct(): void {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;

      const payload: any = {
        name: formValue.name,
        price: formValue.price,
        description: formValue.description,
        categoryId: Number(formValue.categoryId),
        image: formValue.image,
        stock: formValue.stock,
        brand: formValue.brand,
        rating: formValue.rating ?? 0,
        reviews: formValue.reviews ?? 0
      };

      this.articleService.createArticle(payload).subscribe({
        next: newArticle => {
          this.products.push(newArticle);
          this.closeAddProductModal();
          alert('Article ajouté avec succès !');
        },
        error: err => console.error('Erreur ajout:', err)
      });
    }
  }

  updateProduct(): void {
    if (this.productForm.valid && this.selectedProduct) {
      const formValue = this.productForm.value;

      const payload: any = {
        name: formValue.name,
        price: formValue.price,
        description: formValue.description,
        categoryId: Number(formValue.categoryId),
        image: formValue.image,
        stock: formValue.stock,
        brand: formValue.brand,
        rating: formValue.rating ?? 0,
        reviews: formValue.reviews ?? 0
      };

      this.articleService
        .updateArticle(this.selectedProduct.id, payload)
        .subscribe({
          next: updated => {
            const index = this.products.findIndex(
              p => p.id === this.selectedProduct!.id
            );
            if (index !== -1) this.products[index] = updated;
            this.closeEditProductModal();
            alert('Article modifié avec succès !');
          },
          error: err => console.error('Erreur modification:', err)
        });
    }
  }

  deleteProduct(product: Article): void {
    if (confirm('Supprimer cet article ?')) {
      this.articleService.deleteArticle(product.id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== product.id);
          alert('Article supprimé !');
        },
        error: err => console.error('Erreur suppression:', err)
      });
    }
  }

  // ===== ORDERS (OrderService) =====

  private saveLocalOrders(): void {
    const localOrders = this.orders.filter(o => o.apiId == null);
    localStorage.setItem('adminLocalOrders', JSON.stringify(localOrders));
  }

  private loadLocalOrders(): void {
    const saved = localStorage.getItem('adminLocalOrders');
    if (saved) {
      try {
        const localOrders: AdminOrder[] = JSON.parse(saved);
        localOrders.forEach(o => {
          if (!o.id.startsWith('ORD-LOCAL-')) {
            o.id = `ORD-LOCAL-${o.id.replace('ORD-', '')}`;
          }
        });
        this.orders = [
          ...localOrders,
          ...this.orders.filter(o => o.apiId != null)
        ];
      } catch (e) {
        console.error('Failed to parse local orders', e);
      }
    }
  }

  loadOrders(): void {
    this.isLoadingOrders = true;
    this.orderError = null;
    this.orderService.getAllOrders().subscribe({
      next: (data: ApiOrder[]) => {
        this.apiOrders = data;
        this.orders = data.map((apiOrder: ApiOrder) => {
          const user = this.users.find(u => u.id === apiOrder.userId);
          let enrichedCustomer = user
            ? user.nom
            : `Utilisateur ${apiOrder.userId}`;
          let enrichedEmail = user
            ? user.email
            : `user${apiOrder.userId}@example.com`;
          let enrichedAddress = undefined;
          let enrichedPhone = undefined;

          const savedInfoStr = localStorage.getItem(
            `order_info_${apiOrder.id}`
          );
          if (savedInfoStr) {
            try {
              const info = JSON.parse(savedInfoStr);
              if (info.nom || info.prenom)
                enrichedCustomer = `${info.nom} ${info.prenom}`.trim();
              if (info.telephone) {
                enrichedEmail = info.telephone;
                enrichedPhone = info.telephone;
              }
              if (info.adresse) enrichedAddress = info.adresse;
            } catch (e) {
              console.error('Error parsing order info', e);
            }
          }

          return {
            id: `ORD-${apiOrder.id}`,
            apiId: apiOrder.id,
            customer: enrichedCustomer,
            email: enrichedEmail,
            amount:
              apiOrder.total ??
              apiOrder.items?.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              ) ??
              0,
            status: (apiOrder.status || 'CONFIRMED') as any,
            date: new Date(apiOrder.createdAt).toISOString().split('T')[0],
            address: enrichedAddress,
            phone: enrichedPhone
          };
        });
        this.loadLocalOrders();
        this.isLoadingOrders = false;
      },
      error: (error: any) => {
        console.error('Error loading orders:', error);
        this.orderError = 'Failed to load orders from server.';
        this.isLoadingOrders = false;
      }
    });
  }

  getFilteredOrders(): AdminOrder[] {
    const term = (this.orderSearchTerm || '').trim().toLowerCase();
    if (!term) return this.orders;
    return this.orders.filter(
      o =>
        (o.id || '').toLowerCase().includes(term) ||
        (o.customer || '').toLowerCase().includes(term) ||
        (o.email || '').toLowerCase().includes(term) ||
        (o.status || '').toLowerCase().includes(term) ||
        String(o.amount ?? '')
          .toLowerCase()
          .includes(term) ||
        (o.date || '').toLowerCase().includes(term)
    );
  }

  getOrderStats() {
    const list = this.orders;
    const totalOrders = list.length;
    const confirmed = list.filter(
      o => (o.status || '').toUpperCase() === 'CONFIRMED'
    ).length;
    const shipped = list.filter(
      o => (o.status || '').toUpperCase() === 'SHIPPED'
    ).length;
    const delivered = list.filter(
      o => (o.status || '').toUpperCase() === 'DELIVERED'
    ).length;
    const cancelled = list.filter(
      o => (o.status || '').toUpperCase() === 'CANCELLED'
    ).length;
    const revenue = list
      .filter(o => (o.status || '').toUpperCase() !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.amount ?? 0), 0);
    return { totalOrders, confirmed, shipped, delivered, cancelled, revenue };
  }

  viewOrderDetails(orderIdRaw: string | number): void {
    const orderId = String(orderIdRaw);
    const localOrder = this.orders.find(o => o.id === orderId);
    if (!localOrder) return;

    if (localOrder.apiId != null) {
      const apiOrder = this.apiOrders.find(o => o.id === localOrder.apiId);
      if (apiOrder) {
        this.selectedOrder = apiOrder;
        (this.selectedOrder as any).customerName = localOrder.customer;
        (this.selectedOrder as any).address = localOrder.address;
        (this.selectedOrder as any).phone = localOrder.phone;
        this.isViewOrderModalOpen = true;
        return;
      }
    }

    this.selectedOrder = {
      id: localOrder.apiId ?? 0,
      userId: 0,
      status: localOrder.status,
      total: localOrder.amount,
      createdAt: localOrder.date,
      items: []
    } as any;
    (this.selectedOrder as any).customerName = localOrder.customer;
    (this.selectedOrder as any).address = localOrder.address;
    (this.selectedOrder as any).phone = localOrder.phone;
    this.isViewOrderModalOpen = true;
  }

  editOrderStatus(orderIdRaw: string | number): void {
    if (!orderIdRaw) return;
    const orderId = String(orderIdRaw);
    const localOrder = this.orders.find(o => o.id === orderId);
    if (!localOrder) return;

    if (localOrder.apiId != null) {
      const apiOrder = this.apiOrders.find(o => o.id === localOrder.apiId);
      if (apiOrder) {
        this.selectedOrder = apiOrder;
        this.isEditOrderModalOpen = true;
        this.orderForm.patchValue({
          status: apiOrder.status,
          customer: localOrder.customer,
          email: localOrder.email
        });
        return;
      }
    }

    this.selectedOrder = {
      id: localOrder.apiId ?? 0,
      userId: 0,
      status: localOrder.status,
      total: localOrder.amount,
      createdAt: localOrder.date,
      items: []
    } as any;
    this._editingLocalOrderId = orderId;
    this.editOrderAmount = localOrder.amount ?? 0;
    this.isEditOrderModalOpen = true;
    this.orderForm.patchValue({
      status: localOrder.status,
      customer: localOrder.customer,
      email: localOrder.email
    });
  }

  updateOrderStatus(): void {
    if (!this.selectedOrder) return;

    const isApiOrder = this.selectedOrder.id && this.selectedOrder.id !== 0;

    if (isApiOrder) {
      if (this.orderForm.get('status')?.invalid) {
        alert('Veuillez sélectionner un statut valide.');
        return;
      }
    } else {
      if (this.orderForm.invalid) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }
    }

    const newStatus = this.orderService.normalizeBackendStatus(
      this.orderForm.value.status
    );
    if (!newStatus) {
      alert('Veuillez sélectionner un statut valide.');
      return;
    }

    const orderId = this.selectedOrder.id;

    if (isApiOrder) {
      this.orderService.updateStatus(orderId, newStatus).subscribe({
        next: updatedOrder => {
          const apiIndex = this.apiOrders.findIndex(o => o.id === orderId);
          if (apiIndex !== -1) this.apiOrders[apiIndex] = updatedOrder;
          const uiIndex = this.orders.findIndex(o => o.apiId === orderId);
          if (uiIndex !== -1)
            this.orders[uiIndex].status = updatedOrder.status as any;
          this.closeEditOrderModal();
          alert('Statut de la commande mis à jour avec succès !');
        },
        error: err => {
          console.error('Error updating order status:', err);
          alert(
            err.error?.message || 'Erreur lors de la mise à jour du statut.'
          );
        }
      });
    } else if (this._editingLocalOrderId) {
      const uiIndex = this.orders.findIndex(
        o => o.id === this._editingLocalOrderId
      );
      if (uiIndex !== -1) {
        this.orders[uiIndex].status = newStatus;
        if (this.orderForm.value.customer)
          this.orders[uiIndex].customer = this.orderForm.value.customer;
        if (this.orderForm.value.email)
          this.orders[uiIndex].email = this.orderForm.value.email;
        this.orders[uiIndex].amount = this.editOrderAmount;
        this.saveLocalOrders();
      }
      this._editingLocalOrderId = null;
      this.closeEditOrderModal();
      alert('Commande locale mise à jour !');
    }
  }

  deleteOrder(orderIdRaw: string | number): void {
    const orderId = String(orderIdRaw);
    if (confirm('Supprimer cette commande ?')) {
      const localOrder = this.orders.find(o => o.id === orderId);
      if (localOrder?.apiId != null) {
        const apiId = localOrder.apiId;
        this.orderService.cancelOrder(apiId).subscribe({
          next: () => {
            this.apiOrders = this.apiOrders.filter(o => o.id !== apiId);
            this.orders = this.orders.filter(o => o.id !== orderId);
            alert('Commande supprimée !');
          },
          error: () => {
            this.orders = this.orders.filter(o => o.id !== orderId);
          }
        });
      } else {
        this.orders = this.orders.filter(o => o.id !== orderId);
        this.saveLocalOrders();
        alert('Commande supprimée !');
      }
    }
  }

  openAddOrderModal(): void {
    this.isAddOrderModalOpen = true;
    this.newOrderAmount = 0;
    this.orderForm.reset({ status: 'pending' });
  }

  closeAddOrderModal(): void {
    this.isAddOrderModalOpen = false;
    this.orderForm.reset();
  }

  createOrder(): void {
    if (this.orderForm.valid) {
      const newOrder: AdminOrder = {
        id: `ORD-LOCAL-${Date.now()}`,
        apiId: undefined,
        customer: this.orderForm.value.customer,
        email: this.orderForm.value.email,
        amount: this.newOrderAmount ?? 0,
        status: this.orderForm.value.status,
        date: new Date().toISOString().split('T')[0]
      };
      this.orders.unshift(newOrder);
      this.saveLocalOrders();
      this.closeAddOrderModal();
      alert('Commande créée avec succès !');
    } else {
      alert('Veuillez renseigner le client et lemail.');
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
    switch ((status || '').toUpperCase()) {
      case 'DELIVERED':
        return 'success';
      case 'CONFIRMED':
        return 'info';
      case 'SHIPPED':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      case 'CART':
        return 'info';
      default:
        return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch ((status || '').toUpperCase()) {
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
      default:
        return status;
    }
  }

  // ===== CATEGORIES (CategoryService) =====

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: data => {
        this.categories = data;
        this.categoryError = null;
      },
      error: err => {
        this.categoryError = 'Failed to load categories';
        console.error('Error loading categories:', err);
      }
    });
  }

  selectCategoryForEdit(category: AdminCategory): void {
    this.isEditingCategory = true;
    this.selectedCategory = { ...category };
  }

  saveCategory(): void {
    if (this.isEditingCategory && this.selectedCategory.id) {
      this.categoryService
        .update(this.selectedCategory.id, this.selectedCategory)
        .subscribe({
          next: () => {
            this.categorySuccess = 'Category updated successfully';
            this.resetCategoryForm();
            this.loadCategories();
          },
          error: err => {
            this.categoryError = 'Failed to update category';
            console.error(err);
          }
        });
    } else {
      this.categoryService.create(this.selectedCategory).subscribe({
        next: () => {
          this.categorySuccess = 'Category created successfully';
          this.resetCategoryForm();
          this.loadCategories();
        },
        error: err => {
          this.categoryError = 'Failed to create category';
          console.error(err);
        }
      });
    }
  }

  deleteCategory(id: number): void {
    if (confirm('Supprimer cette catégorie ?')) {
      this.categoryService.delete(id).subscribe({
        next: () => {
          this.categorySuccess = 'Category deleted successfully';
          this.loadCategories();
        },
        error: err => {
          this.categoryError = 'Failed to delete category';
          console.error(err);
        }
      });
    }
  }

  resetCategoryForm(): void {
    this.selectedCategory = { name: '', description: '' };
    this.isEditingCategory = false;
    this.categoryError = null;
    setTimeout(() => (this.categorySuccess = null), 3000);
  }

  // ===== PROMO CODES (PromoCodeService) =====

  loadPromos(): void {
    this.promoCodeService.getAllCodes().subscribe({
      next: data => {
        this.promoCodes = data;
        this.promoError = null;
      },
      error: err => {
        this.promoError = 'Failed to load promo codes';
        console.error('Error loading promos:', err);
      }
    });
  }

  // ===== USERS (UserService) =====

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.userError = '';
    this.userService.getAllUsers().subscribe({
      next: data => {
        this.users = data;
        this.filteredUsers = data;
        this.isLoadingUsers = false;
      },
      error: err => {
        console.error('Error loading users:', err);
        this.userError = 'Erreur lors du chargement des utilisateurs';
        this.isLoadingUsers = false;
      }
    });
  }

  filterUsers(): void {
    const term = (this.searchTermUsers || '').toLowerCase();
    this.filteredUsers = this.users.filter(
      u =>
        u.nom.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }

  openAddUserModal(): void {
    this.isAddUserModalOpen = true;
    this.userMessage = '';
    this.userError = '';
    this.userForm.reset({ nom: '', email: '', password: '', role: 'CUSTOMER' });
    this.userForm
      .get('password')
      ?.setValidators([Validators.required, Validators.minLength(4)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  closeAddUserModal(): void {
    this.isAddUserModalOpen = false;
    this.userForm.reset();
  }

  openEditUserModal(user: Utilisateur): void {
    this.selectedUser = user;
    this.isEditUserModalOpen = true;
    this.userMessage = '';
    this.userError = '';
    this.userForm.patchValue({
      nom: user.nom,
      email: user.email,
      password: '',
      role: user.role
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  closeEditUserModal(): void {
    this.isEditUserModalOpen = false;
    this.selectedUser = null;
    this.userForm.reset();
  }

  addUser(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(k => {
        this.userForm.get(k)?.markAsTouched();
      });
      return;
    }
    this.userService.createUser(this.userForm.value).subscribe({
      next: created => {
        this.users.push(created);
        this.filterUsers();
        this.userMessage = 'Utilisateur créé avec succès !';
        this.closeAddUserModal();
        setTimeout(() => (this.userMessage = ''), 3000);
      },
      error: err => {
        console.error(err);
        this.userError = 'Erreur lors de la création';
      }
    });
  }

  updateUser(): void {
    if (!this.selectedUser || !this.selectedUser.id) return;

    const updated: any = {
      nom: this.userForm.value.nom,
      email: this.userForm.value.email,
      role: this.userForm.value.role
    };
    if (this.userForm.value.password)
      updated.password = this.userForm.value.password;

    this.userService.updateUser(this.selectedUser.id, updated).subscribe({
      next: user => {
        const idx = this.users.findIndex(u => u.id === user.id);
        if (idx !== -1) this.users[idx] = user;
        this.filterUsers();
        this.userMessage = 'Utilisateur modifié avec succès !';
        this.closeEditUserModal();
        setTimeout(() => (this.userMessage = ''), 3000);
      },
      error: err => {
        console.error(err);
        this.userError = 'Erreur lors de la modification';
      }
    });
  }

  deleteUser(userId: number | undefined): void {
    if (!userId) return;
    if (confirm('Supprimer cet utilisateur ?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
          this.filterUsers();
          this.userMessage = 'Utilisateur supprimé !';
          setTimeout(() => (this.userMessage = ''), 3000);
        },
        error: err => {
          console.error(err);
          this.userError = 'Erreur lors de la suppression';
        }
      });
    }
  }

  getRoleLabel(role: string): string {
    return role === 'ADMIN' ? 'Administrateur' : 'Client';
  }

  getRoleBadgeColor(role: string): string {
    return role === 'ADMIN' ? 'danger' : 'info';
  }

  selectPromoForEdit(promo: PromoCode): void {
    this.isEditingPromo = true;
    this.selectedPromoCode = { ...promo };
    if (this.selectedPromoCode.expiryDate) {
      this.selectedPromoCode.expiryDate = new Date(
        this.selectedPromoCode.expiryDate
      )
        .toISOString()
        .slice(0, 16);
    }
  }

  savePromo(): void {
    if (this.isEditingPromo && this.selectedPromoCode.id) {
      this.promoCodeService
        .updateCode(this.selectedPromoCode.id, this.selectedPromoCode)
        .subscribe({
          next: () => {
            this.promoSuccess = 'Code promo modifié.';
            this.resetPromoForm();
            this.loadPromos();
          },
          error: () => (this.promoError = 'Erreur modification.')
        });
    } else {
      this.promoCodeService.createCode(this.selectedPromoCode).subscribe({
        next: () => {
          this.promoSuccess = 'Code promo ajouté.';
          this.resetPromoForm();
          this.loadPromos();
        },
        error: () => (this.promoError = 'Erreur création.')
      });
    }
  }

  deletePromo(id: number): void {
    if (confirm('Supprimer ce code promo ?')) {
      this.promoCodeService.deleteCode(id).subscribe({
        next: () => {
          this.promoSuccess = 'Code promo supprimé.';
          this.loadPromos();
        },
        error: () => (this.promoError = 'Erreur suppression.')
      });
    }
  }

  togglePromoActive(id: number): void {
    this.promoCodeService.toggleActive(id).subscribe({
      next: () => this.loadPromos(),
      error: () =>
        (this.promoError = "Erreur lors de l'activation/désactivation.")
    });
  }

  resetPromoForm(): void {
    this.selectedPromoCode = {
      code: '',
      discountType: 'PERCENTAGE',
      value: 0,
      expiryDate: '',
      maxUsages: 100,
      active: true
    };
    this.isEditingPromo = false;
    this.promoError = null;
    setTimeout(() => (this.promoSuccess = null), 3000);
  }
}
