import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleService, Article } from '../article-catalog/article.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  email: string = '';
  cartCount: number = 0;
  isMenuOpen: boolean = false;

  features = [
    {
      title: 'Livraison Express',
      description: 'Livraison en 24-48h offerte dès 50€ d\'achat',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Paiement Sécurisé',
      description: 'Transactions 100% sécurisées avec cryptage SSL',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V8a4 4 0 00-8 0v3h8z" />',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Service Client 24/7',
      description: 'Une équipe dédiée à votre écoute 7j/7',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Retours Gratuits',
      description: 'Retour sous 30 jours, remboursement intégral',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ];

  products: Article[] = [];

  testimonials = [
    {
      name: 'Sophie Martin',
      title: 'Directrice Marketing',
      text: 'Une expérience d\'achat exceptionnelle ! Les produits sont de qualité et le service client est réactif.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      name: 'Thomas Dubois',
      title: 'Entrepreneur',
      text: 'La livraison est rapide et le suivi de commande impeccable. Je recommande vivement !',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    },
    {
      name: 'Marie Laurent',
      title: 'Designer',
      text: 'Les produits sont magnifiques et parfaitement emballés. Un vrai plaisir de commander ici.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    }
  ];

  constructor(
    private router: Router,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.articleService.getAllArticles().subscribe({
      next: (data) => {
        this.products = data.slice(0, 4);
      },
      error: (err) => {
        console.error('Erreur chargement landing page:', err);
      }
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onSignIn(): void {
    this.router.navigate(['/signin']);
  }

  onSignUp(): void {
    this.router.navigate(['/signup']);
  }

  onSearch(): void {
    console.log('Search clicked');
  }

  onShopNow(): void {
    this.router.navigate(['/produits']);
  }

  onLearnMore(): void {
    console.log('Learn more clicked');
  }

  onQuickView(product: Article): void {
    this.router.navigate(['/produits']);
  }

  onAddToCart(product: Article): void {
    this.cartCount++;
    console.log('Added to cart:', product);
  }

  onViewOrders(): void {
    this.router.navigate(['/orders']);
  }

  onViewAllProducts(): void {
    this.router.navigate(['/produits']);
  }

  onOpenCart(): void {
    this.router.navigate(['/cart']);
  }

  onSubscribe(): void {
    if (this.isValidEmail()) {
      console.log('Subscribe with email:', this.email);
      this.email = '';
      alert('Merci de vous être abonné à notre newsletter !');
    }
  }

  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
}