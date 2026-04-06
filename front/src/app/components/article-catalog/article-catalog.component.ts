import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ArticleService, Article } from '../../services/article.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-article-catalog',
  templateUrl: './article-catalog.component.html',
  styleUrls: ['./article-catalog.component.css']
})
export class ArticleCatalogComponent implements OnInit {

  articles: Article[] = [];
  filteredArticles: Article[] = [];

  searchTerm = '';
  selectedCategory = 'all';
  selectedBrand = 'all';
  selectedPriceRange = 'all';
  selectedRating = 0;
  inStockOnly = false;

  categories: string[] = [];
  brands: string[] = [];
  priceRanges = [
    { value: 'all', label: 'Tous les prix' },
    { value: '0-50', label: 'Moins de 50 €' },
    { value: '50-100', label: '50 € - 100 €' },
    { value: '100-200', label: '100 € - 200 €' },
    { value: '200+', label: 'Plus de 200 €' }
  ];

  sortOption = 'featured';
  sortOptions = [
    { value: 'featured', label: 'En vedette' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'rating-desc', label: 'Meilleures notes' }
  ];

  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  viewMode: 'grid' | 'list' = 'grid';

  cartItems: any[] = [];
  showCartSidebar = false;

  searchForm: FormGroup;

  constructor(
    public router: Router,
    private fb: FormBuilder,
    private articleService: ArticleService,
    private orderService: OrderService
  ) {
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.articleService.getAllArticles().subscribe({
      next: (data) => {
        this.articles = data;
        this.categories = ['all', ...new Set(data.map(a => a.category))];
        this.brands = ['all', ...new Set(data.map(a => a.brand))];
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur chargement articles:', err);
      }
    });
  }

  getCategoryCount(category: string): number {
    if (category === 'all') return this.articles.length;
    return this.articles.filter(a => a.category === category).length;
  }

  getStarArray(count: number): any[] {
    return new Array(count);
  }

  applyFilters(): void {
    let filtered = [...this.articles];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(article =>
        article.name.toLowerCase().includes(term) ||
        article.description.toLowerCase().includes(term) ||
        article.category.toLowerCase().includes(term) ||
        article.brand.toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === this.selectedCategory);
    }

    if (this.selectedBrand !== 'all') {
      filtered = filtered.filter(a => a.brand === this.selectedBrand);
    }

    if (this.selectedPriceRange !== 'all') {
      filtered = filtered.filter(article => {
        const price = article.price;
        switch (this.selectedPriceRange) {
          case '0-50': return price < 50;
          case '50-100': return price >= 50 && price <= 100;
          case '100-200': return price > 100 && price <= 200;
          case '200+': return price > 200;
          default: return true;
        }
      });
    }

    if (this.selectedRating > 0) {
      filtered = filtered.filter(a => a.rating >= this.selectedRating);
    }

    if (this.inStockOnly) {
      filtered = filtered.filter(a => a.stock > 0);
    }

    switch (this.sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    this.filteredArticles = filtered;
    this.totalPages = Math.ceil(this.filteredArticles.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  filterByBrand(brand: string): void {
    this.selectedBrand = brand;
    this.applyFilters();
  }

  filterByPrice(range: string): void {
    this.selectedPriceRange = range;
    this.applyFilters();
  }

  filterByRating(rating: number): void {
    this.selectedRating = rating;
    this.applyFilters();
  }

  changeSort(sort: string): void {
    this.sortOption = sort;
    this.applyFilters();
  }

  changeView(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.searchForm.get('search')?.setValue('');
    this.selectedCategory = 'all';
    this.selectedBrand = 'all';
    this.selectedPriceRange = 'all';
    this.selectedRating = 0;
    this.inStockOnly = false;
    this.sortOption = 'featured';
    this.applyFilters();
  }

  getPaginatedArticles(): Article[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredArticles.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  addToCart(article: Article): void {
    const existingItem = this.cartItems.find(item => item.id === article.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cartItems.push({ ...article, quantity: 1 });
    }
    this.showCartSidebar = true;

    // Sync with backend order service
    // Always add 1 more unit in backend as well
    this.orderService.addToCart(1, article.id, article.name, article.price, 1).subscribe({
      next: () => console.log('Added to backend cart'),
      error: (err: any) => console.error('Failed to add to backend', err)
    });
  }

  updateQuantity(articleId: number, newQuantity: number): void {
    const item = this.cartItems.find(i => i.id === articleId);
    if (item) {
      if (newQuantity <= 0) {
        this.cartItems = this.cartItems.filter(i => i.id !== articleId);
      } else {
        item.quantity = newQuantity;
      }
    }
  }

  removeFromCart(articleId: number): void {
    this.cartItems = this.cartItems.filter(i => i.id !== articleId);
  }

  getCartTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  goToCheckout(): void {
    this.router.navigate(['/cart']);
  }

  viewArticle(articleId: number): void {
    this.router.navigate(['/article', articleId]);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  }

  getRatingStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('½');
    }
    while (stars.length < 5) {
      stars.push('☆');
    }
    return stars;
  }
}