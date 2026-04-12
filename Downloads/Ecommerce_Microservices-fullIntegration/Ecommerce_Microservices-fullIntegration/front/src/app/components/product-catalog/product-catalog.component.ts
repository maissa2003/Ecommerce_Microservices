import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  subcategory?: string;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  stock: number;
  isNew?: boolean;
  isOnSale?: boolean;
  discount?: number;
  brand: string;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
}

@Component({
  selector: 'app-product-catalog',
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.css']
})
export class ProductCatalogComponent implements OnInit {
  // Liste des produits
  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Filtres
  searchTerm = '';
  selectedCategory = 'all';
  selectedBrand = 'all';
  selectedPriceRange = 'all';
  selectedRating = 0;
  inStockOnly = false;
  onSaleOnly = false;

  // Catégories et marques
  categories: string[] = [];
  brands: string[] = [];
  priceRanges = [
    { value: 'all', label: 'Tous les prix' },
    { value: '0-50', label: 'Moins de 50 €' },
    { value: '50-100', label: '50 € - 100 €' },
    { value: '100-200', label: '100 € - 200 €' },
    { value: '200+', label: 'Plus de 200 €' }
  ];

  // Tri
  sortOption = 'featured';
  sortOptions = [
    { value: 'featured', label: 'En vedette' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'rating-desc', label: 'Meilleures notes' },
    { value: 'newest', label: 'Plus récents' }
  ];

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  // Vue
  viewMode: 'grid' | 'list' = 'grid';

  // Panier
  cartItems: any[] = [];
  showCartSidebar = false;

  // Formulaire de recherche
  searchForm: FormGroup;

  constructor(
    public router: Router, // Changé de private à public pour l'accès dans le template
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  // Charger les produits (simulation API)
  loadProducts(): void {
    this.products = [
      // Électronique
      {
        id: 1,
        name: 'Smartwatch Pro X',
        price: 299,
        originalPrice: 399,
        description:
          "Montre connectée haut de gamme avec GPS, suivi d'activité et autonomie de 7 jours.",
        category: 'Électronique',
        subcategory: 'Montres connectées',
        image:
          'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop',
        rating: 4.8,
        reviews: 234,
        stock: 45,
        isNew: true,
        isOnSale: true,
        discount: 25,
        brand: 'TechPro',
        colors: ['Noir', 'Argent', 'Or'],
        tags: ['montre', 'sport', 'connectée']
      },
      {
        id: 2,
        name: 'Écouteurs Sans Fil Pro',
        price: 129,
        originalPrice: 179,
        description:
          'Écouteurs Bluetooth avec réduction de bruit active et autonomie de 24h.',
        category: 'Électronique',
        subcategory: 'Audio',
        image:
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
        rating: 4.6,
        reviews: 567,
        stock: 120,
        isOnSale: true,
        discount: 28,
        brand: 'AudioPlus',
        colors: ['Blanc', 'Noir'],
        tags: ['écouteurs', 'bluetooth', 'audio']
      },
      {
        id: 3,
        name: 'Tablette Ultra HD',
        price: 499,
        description:
          'Tablette 11 pouces avec écran Liquid Retina et processeur M1.',
        category: 'Électronique',
        subcategory: 'Tablettes',
        image:
          'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=400&h=400&fit=crop',
        rating: 4.9,
        reviews: 89,
        stock: 23,
        isNew: true,
        brand: 'TechPro',
        colors: ['Gris', 'Argent', 'Rose'],
        tags: ['tablette', 'écran', 'haut de gamme']
      },
      {
        id: 4,
        name: 'Enceinte Bluetooth',
        price: 79,
        originalPrice: 99,
        description:
          "Enceinte portable étanche avec son 360° et 20h d'autonomie.",
        category: 'Électronique',
        subcategory: 'Audio',
        image:
          'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400&h=400&fit=crop',
        rating: 4.5,
        reviews: 312,
        stock: 78,
        isOnSale: true,
        discount: 20,
        brand: 'AudioPlus',
        colors: ['Noir', 'Bleu', 'Rouge'],
        tags: ['enceinte', 'bluetooth', 'portable']
      },

      // Mode
      {
        id: 5,
        name: 'Sac à Dos Urbain',
        price: 79,
        description:
          'Sac à dos en toile résistante avec compartiment pour ordinateur 15 pouces.',
        category: 'Mode',
        subcategory: 'Accessoires',
        image:
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
        rating: 4.7,
        reviews: 456,
        stock: 34,
        brand: 'UrbanStyle',
        colors: ['Noir', 'Kaki', 'Bleu'],
        tags: ['sac', 'urbain', 'école']
      },
      {
        id: 6,
        name: 'Montre Classique',
        price: 199,
        description:
          'Montre à quartz avec bracelet en cuir véritable et boîtier en acier inoxydable.',
        category: 'Mode',
        subcategory: 'Montres',
        image:
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&h=400&fit=crop',
        rating: 4.8,
        reviews: 178,
        stock: 12,
        brand: 'Elegance',
        colors: ['Marron', 'Noir', 'Bleu'],
        tags: ['montre', 'classique', 'cuir']
      },
      {
        id: 7,
        name: 'Casquette Tendance',
        price: 29,
        description: 'Casquette en coton bio avec fermeture ajustable.',
        category: 'Mode',
        subcategory: 'Accessoires',
        image:
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
        rating: 4.3,
        reviews: 234,
        stock: 89,
        brand: 'UrbanStyle',
        colors: ['Noir', 'Blanc', 'Bleu'],
        tags: ['casquette', 'tendance', 'été']
      },

      // Maison
      {
        id: 8,
        name: 'Lampe Design',
        price: 89,
        description: "Lampe de table design avec variateur d'intensité.",
        category: 'Maison',
        subcategory: 'Décoration',
        image:
          'https://images.unsplash.com/photo-1507473885765-e6c057f00f68?w=400&h=400&fit=crop',
        rating: 4.6,
        reviews: 67,
        stock: 45,
        brand: 'HomeStyle',
        colors: ['Blanc', 'Noir', 'Or'],
        tags: ['lampe', 'décoration', 'design']
      },
      {
        id: 9,
        name: 'Coussin Confort',
        price: 39,
        originalPrice: 49,
        description: 'Coussin moelleux en velours avec housse amovible.',
        category: 'Maison',
        subcategory: 'Textile',
        image:
          'https://images.unsplash.com/photo-1584100936591-c0654b55a2e2?w=400&h=400&fit=crop',
        rating: 4.5,
        reviews: 123,
        stock: 67,
        isOnSale: true,
        discount: 20,
        brand: 'HomeStyle',
        colors: ['Beige', 'Gris', 'Vert'],
        tags: ['coussin', 'confort', 'salon']
      },

      // Sport
      {
        id: 10,
        name: 'Tapis de Yoga',
        price: 49,
        description: 'Tapis de yoga antidérapant avec sac de transport inclus.',
        category: 'Sport',
        subcategory: 'Fitness',
        image:
          'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400&h=400&fit=crop',
        rating: 4.7,
        reviews: 345,
        stock: 56,
        isNew: true,
        brand: 'FitLife',
        colors: ['Violet', 'Bleu', 'Rose'],
        tags: ['yoga', 'fitness', 'sport']
      },
      {
        id: 11,
        name: 'Gourde Isotherme',
        price: 29,
        description: 'Gourde inoxydable gardant les boissons au frais 24h.',
        category: 'Sport',
        subcategory: 'Accessoires',
        image:
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
        rating: 4.8,
        reviews: 567,
        stock: 120,
        brand: 'FitLife',
        colors: ['Noir', 'Bleu', 'Rouge'],
        tags: ['gourde', 'sport', 'écologie']
      },
      {
        id: 12,
        name: 'Smartphone Pro Max',
        price: 899,
        originalPrice: 999,
        description:
          'Smartphone haut de gamme avec appareil photo pro et batterie longue durée.',
        category: 'Électronique',
        subcategory: 'Téléphones',
        image:
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop',
        rating: 4.9,
        reviews: 1234,
        stock: 45,
        isNew: true,
        isOnSale: true,
        discount: 10,
        brand: 'TechPro',
        colors: ['Noir', 'Blanc', 'Or'],
        tags: ['smartphone', 'photo', 'haut de gamme']
      },
      {
        id: 13,
        name: 'Chaussures de Running',
        price: 119,
        description:
          'Chaussures de running avec amorti optimal et respirabilité.',
        category: 'Sport',
        subcategory: 'Chaussures',
        image:
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        rating: 4.7,
        reviews: 890,
        stock: 34,
        brand: 'FitLife',
        colors: ['Bleu', 'Noir', 'Rouge'],
        sizes: ['39', '40', '41', '42', '43', '44'],
        tags: ['running', 'sport', 'chaussures']
      },
      {
        id: 14,
        name: 'Set de Casseroles',
        price: 149,
        originalPrice: 199,
        description: 'Set de 5 casseroles en inox avec revêtement antiadhésif.',
        category: 'Maison',
        subcategory: 'Cuisine',
        image:
          'https://images.unsplash.com/photo-1584990347449-6b8dc5a2da11?w=400&h=400&fit=crop',
        rating: 4.6,
        reviews: 234,
        stock: 23,
        isOnSale: true,
        discount: 25,
        brand: 'HomeStyle',
        tags: ['cuisine', 'casserole', 'inox']
      },
      {
        id: 15,
        name: 'Veste en Jean',
        price: 89,
        description: 'Veste en jean délavé avec poches classiques.',
        category: 'Mode',
        subcategory: 'Vêtements',
        image:
          'https://images.unsplash.com/photo-1576995853123-5b10305d93c0?w=400&h=400&fit=crop',
        rating: 4.5,
        reviews: 456,
        stock: 56,
        brand: 'UrbanStyle',
        colors: ['Bleu', 'Noir', 'Gris'],
        sizes: ['S', 'M', 'L', 'XL'],
        tags: ['veste', 'jean', 'mode']
      }
    ];

    // Extraire les catégories et marques uniques
    this.categories = ['all', ...new Set(this.products.map(p => p.category))];
    this.brands = ['all', ...new Set(this.products.map(p => p.brand))];

    this.applyFilters();
  }

  // Obtenir le nombre de produits par catégorie
  getCategoryCount(category: string): number {
    if (category === 'all') {
      return this.products.length;
    }
    return this.products.filter(p => p.category === category).length;
  }

  // Obtenir un tableau pour les étoiles
  getStarArray(count: number): any[] {
    return new Array(count);
  }

  // Appliquer tous les filtres
  applyFilters(): void {
    let filtered = [...this.products];

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          product.brand.toLowerCase().includes(term) ||
          product.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Filtre par catégorie
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(
        product => product.category === this.selectedCategory
      );
    }

    // Filtre par marque
    if (this.selectedBrand !== 'all') {
      filtered = filtered.filter(
        product => product.brand === this.selectedBrand
      );
    }

    // Filtre par prix
    if (this.selectedPriceRange !== 'all') {
      filtered = filtered.filter(product => {
        const price = product.price;
        switch (this.selectedPriceRange) {
          case '0-50':
            return price < 50;
          case '50-100':
            return price >= 50 && price <= 100;
          case '100-200':
            return price > 100 && price <= 200;
          case '200+':
            return price > 200;
          default:
            return true;
        }
      });
    }

    // Filtre par note
    if (this.selectedRating > 0) {
      filtered = filtered.filter(
        product => product.rating >= this.selectedRating
      );
    }

    // Filtre stock
    if (this.inStockOnly) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Filtre promotions
    if (this.onSaleOnly) {
      filtered = filtered.filter(product => product.isOnSale);
    }

    // Tri
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
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // featured - garder l'ordre original
        break;
    }

    this.filteredProducts = filtered;
    this.totalPages = Math.ceil(
      this.filteredProducts.length / this.itemsPerPage
    );
    this.currentPage = 1;
  }

  // Recherche rapide
  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  // Filtre par catégorie
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  // Filtre par marque
  filterByBrand(brand: string): void {
    this.selectedBrand = brand;
    this.applyFilters();
  }

  // Filtre par prix
  filterByPrice(range: string): void {
    this.selectedPriceRange = range;
    this.applyFilters();
  }

  // Filtre par note
  filterByRating(rating: number): void {
    this.selectedRating = rating;
    this.applyFilters();
  }

  // Changer le tri
  changeSort(sort: string): void {
    this.sortOption = sort;
    this.applyFilters();
  }

  // Changer la vue
  changeView(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // Réinitialiser tous les filtres
  resetFilters(): void {
    this.searchTerm = '';
    this.searchForm.get('search')?.setValue('');
    this.selectedCategory = 'all';
    this.selectedBrand = 'all';
    this.selectedPriceRange = 'all';
    this.selectedRating = 0;
    this.inStockOnly = false;
    this.onSaleOnly = false;
    this.sortOption = 'featured';
    this.applyFilters();
  }

  // Obtenir les produits paginés
  getPaginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts.slice(start, end);
  }

  // Changer de page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Obtenir les numéros de page
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

  // Ajouter au panier
  addToCart(product: Product): void {
    const existingItem = this.cartItems.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cartItems.push({ ...product, quantity: 1 });
    }

    this.showCartSidebar = true;
    setTimeout(() => {
      // Auto hide after 3 seconds
    }, 3000);
  }

  // Mettre à jour la quantité
  updateQuantity(productId: number, newQuantity: number): void {
    const item = this.cartItems.find(i => i.id === productId);
    if (item) {
      if (newQuantity <= 0) {
        this.cartItems = this.cartItems.filter(i => i.id !== productId);
      } else {
        item.quantity = newQuantity;
      }
    }
  }

  // Supprimer du panier
  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(i => i.id !== productId);
  }

  // Obtenir le total du panier
  getCartTotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  // Aller au checkout
  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  // Voir le détail du produit
  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  // Formater le prix
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  // Obtenir le pourcentage de réduction
  getDiscountPercent(product: Product): number {
    if (product.isOnSale && product.originalPrice) {
      return Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      );
    }
    return 0;
  }

  // Générer les étoiles de notation (retourne des caractères)
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
