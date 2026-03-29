import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArticleService, Article } from '../article-catalog/article.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  isSidebarCollapsed = false;
  activeTab = 'overview';

  isAddProductModalOpen = false;
  isEditProductModalOpen = false;
  selectedProduct: Article | null = null;

  isViewOrderModalOpen = false;
  isEditOrderModalOpen = false;
  selectedOrder: any = null;

  products: Article[] = [];
  orders: any[] = [];

  isLoadingProducts = false;
  isLoadingOrders = false;

  productForm: FormGroup;
  orderForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private articleService: ArticleService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      image: ['', Validators.required],
      stock: ['', [Validators.required, Validators.min(0)]],
      brand: ['', Validators.required],
      rating: [0],
      reviews: [0]
    });

    this.orderForm = this.fb.group({
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    localStorage.setItem('isAdmin', 'true');
    this.loadProducts();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    this.router.navigate(['/']);
  }

  // ===== PRODUITS =====

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.articleService.getAllArticles().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoadingProducts = false;
      },
      error: (err) => {
        console.error('Erreur chargement articles:', err);
        this.isLoadingProducts = false;
      }
    });
  }

  openAddProductModal(): void {
    this.isAddProductModalOpen = true;
    this.productForm.reset({ rating: 0, reviews: 0 });
  }

  closeAddProductModal(): void {
    this.isAddProductModalOpen = false;
  }

  openEditProductModal(product: Article): void {
    this.selectedProduct = product;
    this.isEditProductModalOpen = true;
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
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
  }

  addProduct(): void {
    if (this.productForm.valid) {
      this.articleService.createArticle(this.productForm.value).subscribe({
        next: (newArticle) => {
          this.products.push(newArticle);
          this.closeAddProductModal();
          alert('Article ajouté avec succès !');
        },
        error: (err) => console.error('Erreur ajout:', err)
      });
    }
  }

  updateProduct(): void {
    if (this.productForm.valid && this.selectedProduct) {
      this.articleService.updateArticle(this.selectedProduct.id, this.productForm.value).subscribe({
        next: (updated) => {
          const index = this.products.findIndex(p => p.id === this.selectedProduct!.id);
          if (index !== -1) this.products[index] = updated;
          this.closeEditProductModal();
          alert('Article modifié avec succès !');
        },
        error: (err) => console.error('Erreur modification:', err)
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
        error: (err) => console.error('Erreur suppression:', err)
      });
    }
  }

  // ===== COMMANDES — vides =====
  loadOrders(): void {
    this.orders = [];
    this.isLoadingOrders = false;
  }

  viewOrderDetails(orderId: any): void {}
  editOrderStatus(orderId: any): void {}
  updateOrderStatus(): void {}
  deleteOrder(orderId: any): void {}
  openAddOrderModal(): void {}
  closeViewOrderModal(): void {}
  closeEditOrderModal(): void {}

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'pending': return 'info';
      case 'cancelled': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'processing': return 'En cours';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  }
}