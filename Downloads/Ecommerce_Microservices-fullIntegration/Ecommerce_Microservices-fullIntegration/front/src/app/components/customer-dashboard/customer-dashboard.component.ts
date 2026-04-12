import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface Order {
  id: string;
  date: string;
  status: 'delivered' | 'processing' | 'shipped' | 'cancelled';
  total: number;
  items: number;
  tracking?: string;
}

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface Address {
  id: number;
  type: 'home' | 'work' | 'other';
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: number;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  email?: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  // Données utilisateur
  user: any = {
    name: 'Sophie Martin',
    email: 'sophie.martin@email.com',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    memberSince: '2023-01-15',
    phone: '+33 6 12 34 56 78'
  };

  // Onglet actif
  activeTab: 'overview' | 'orders' | 'wishlist' | 'addresses' | 'settings' =
    'overview';

  // Commandes
  orders: Order[] = [
    {
      id: '#ORD-001',
      date: '2024-03-15',
      status: 'delivered',
      total: 299,
      items: 2,
      tracking: 'TRK123456789'
    },
    {
      id: '#ORD-002',
      date: '2024-03-10',
      status: 'shipped',
      total: 129,
      items: 1,
      tracking: 'TRK987654321'
    },
    {
      id: '#ORD-003',
      date: '2024-03-05',
      status: 'processing',
      total: 79,
      items: 1
    },
    {
      id: '#ORD-004',
      date: '2024-02-28',
      status: 'delivered',
      total: 199,
      items: 3
    },
    {
      id: '#ORD-005',
      date: '2024-02-20',
      status: 'cancelled',
      total: 399,
      items: 2
    }
  ];

  // Liste de souhaits
  wishlist: WishlistItem[] = [
    {
      id: 1,
      name: 'Smartwatch Pro',
      price: 299,
      image:
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop',
      category: 'Électronique'
    },
    {
      id: 2,
      name: 'Écouteurs Sans Fil',
      price: 129,
      image:
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop',
      category: 'Audio'
    },
    {
      id: 3,
      name: 'Sac à Dos Urbain',
      price: 79,
      image:
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
      category: 'Accessoires'
    }
  ];

  // Adresses
  addresses: Address[] = [
    {
      id: 1,
      type: 'home',
      name: 'Sophie Martin',
      address: '15 Rue de Paris',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      isDefault: true
    },
    {
      id: 2,
      type: 'work',
      name: 'Sophie Martin',
      address: '123 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
      isDefault: false
    }
  ];

  // Moyens de paiement
  paymentMethods: PaymentMethod[] = [
    {
      id: 1,
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      isDefault: true
    },
    {
      id: 2,
      type: 'paypal',
      email: 'sophie.martin@email.com',
      isDefault: false
    }
  ];

  // Formulaires
  profileForm: FormGroup;
  passwordForm: FormGroup;
  addressForm: FormGroup;
  paymentForm: FormGroup;

  // Modals
  isAddAddressModalOpen = false;
  isEditAddressModalOpen = false;
  selectedAddress: Address | null = null;
  isAddPaymentModalOpen = false;
  isEditPaymentModalOpen = false;
  selectedPayment: PaymentMethod | null = null;

  // Statistiques
  totalOrders = 0;
  totalSpent = 0;
  activeOrders = 0;

  constructor(private router: Router, private fb: FormBuilder) {
    // Formulaire profil
    this.profileForm = this.fb.group({
      name: [this.user.name, [Validators.required, Validators.minLength(2)]],
      email: [this.user.email, [Validators.required, Validators.email]],
      phone: [this.user.phone, [Validators.pattern(/^[0-9+\-\s]{10,}$/)]]
    });

    // Formulaire mot de passe
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );

    // Formulaire adresse
    this.addressForm = this.fb.group({
      type: ['home'],
      name: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      country: ['France', [Validators.required]],
      isDefault: [false]
    });

    // Formulaire paiement
    this.paymentForm = this.fb.group({
      type: ['card'],
      cardNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{16}$/)]
      ],
      cardName: ['', [Validators.required]],
      expiryDate: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
        ]
      ],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      isDefault: [false]
    });
  }

  ngOnInit(): void {
    this.loadStatistics();
    this.loadUserData();
  }

  // Vérifier que les mots de passe correspondent
  passwordMatchValidator(group: FormGroup): any {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  // Charger les statistiques
  loadStatistics(): void {
    const deliveredOrders = this.orders.filter(o => o.status === 'delivered');
    this.totalOrders = this.orders.length;
    this.totalSpent = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    this.activeOrders = this.orders.filter(
      o => o.status === 'processing' || o.status === 'shipped'
    ).length;
  }

  // Charger les données utilisateur (simulation)
  loadUserData(): void {
    // Dans une vraie application, récupérer depuis l'API
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        phone: this.user.phone
      });
    }
  }

  // Changer d'onglet
  setActiveTab(
    tab: 'overview' | 'orders' | 'wishlist' | 'addresses' | 'settings'
  ): void {
    this.activeTab = tab;
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  // Obtenir le libellé du statut
  getStatusLabel(status: string): string {
    switch (status) {
      case 'delivered':
        return 'Livrée';
      case 'processing':
        return 'En traitement';
      case 'shipped':
        return 'Expédiée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  }

  // Obtenir la classe du statut
  getStatusClass(status: string): string {
    switch (status) {
      case 'delivered':
        return 'status-delivered';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  // Obtenir l'icône du type d'adresse
  getAddressIcon(type: string): string {
    switch (type) {
      case 'home':
        return '🏠';
      case 'work':
        return '💼';
      default:
        return '📍';
    }
  }

  // Obtenir l'icône du type de paiement
  getPaymentIcon(type: string): string {
    switch (type) {
      case 'card':
        return '💳';
      case 'paypal':
        return 'PayPal';
      default:
        return '💰';
    }
  }

  // Formater le prix
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  // Modifier le profil
  updateProfile(): void {
    if (this.profileForm.valid) {
      this.user = { ...this.user, ...this.profileForm.value };
      localStorage.setItem('user', JSON.stringify(this.user));
      alert('Profil mis à jour avec succès !');
    }
  }

  // Changer le mot de passe
  changePassword(): void {
    if (this.passwordForm.valid) {
      // Simuler un appel API
      alert('Mot de passe changé avec succès !');
      this.passwordForm.reset();
    }
  }

  // Supprimer un produit de la liste de souhaits
  removeFromWishlist(productId: number): void {
    if (confirm('Retirer ce produit de votre liste de souhaits ?')) {
      this.wishlist = this.wishlist.filter(item => item.id !== productId);
      alert('Produit retiré de la liste de souhaits');
    }
  }

  // Ajouter au panier
  addToCart(product: WishlistItem): void {
    alert(`${product.name} ajouté au panier !`);
    // Logique d'ajout au panier
  }

  // Commander à nouveau
  reorder(orderId: string): void {
    alert(`Commande ${orderId} ajoutée au panier !`);
  }

  // Annuler une commande
  cancelOrder(orderId: string): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      const order = this.orders.find(o => o.id === orderId);
      if (order && order.status === 'processing') {
        order.status = 'cancelled';
        alert(`Commande ${orderId} annulée avec succès`);
      } else {
        alert('Cette commande ne peut pas être annulée');
      }
    }
  }

  // Voir les détails de commande
  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/order', orderId]);
  }

  // Gestion des adresses
  openAddAddressModal(): void {
    this.addressForm.reset({
      type: 'home',
      country: 'France',
      isDefault: false
    });
    this.isAddAddressModalOpen = true;
  }

  closeAddAddressModal(): void {
    this.isAddAddressModalOpen = false;
  }

  addAddress(): void {
    if (this.addressForm.valid) {
      const newAddress: Address = {
        id: this.addresses.length + 1,
        ...this.addressForm.value
      };

      if (newAddress.isDefault) {
        this.addresses.forEach(a => (a.isDefault = false));
      }

      this.addresses.push(newAddress);
      this.closeAddAddressModal();
      alert('Adresse ajoutée avec succès !');
    }
  }

  openEditAddressModal(address: Address): void {
    this.selectedAddress = address;
    this.addressForm.patchValue(address);
    this.isEditAddressModalOpen = true;
  }

  closeEditAddressModal(): void {
    this.isEditAddressModalOpen = false;
    this.selectedAddress = null;
  }

  updateAddress(): void {
    if (this.addressForm.valid && this.selectedAddress) {
      const index = this.addresses.findIndex(
        a => a.id === this.selectedAddress!.id
      );
      if (index !== -1) {
        const updatedAddress = {
          ...this.selectedAddress,
          ...this.addressForm.value
        };

        if (updatedAddress.isDefault) {
          this.addresses.forEach(a => (a.isDefault = false));
        }

        this.addresses[index] = updatedAddress;
        this.closeEditAddressModal();
        alert('Adresse modifiée avec succès !');
      }
    }
  }

  deleteAddress(addressId: number): void {
    if (confirm('Supprimer cette adresse ?')) {
      this.addresses = this.addresses.filter(a => a.id !== addressId);
      alert('Adresse supprimée');
    }
  }

  setDefaultAddress(addressId: number): void {
    this.addresses.forEach(a => {
      a.isDefault = a.id === addressId;
    });
    alert('Adresse par défaut mise à jour');
  }

  // Gestion des moyens de paiement
  openAddPaymentModal(): void {
    this.paymentForm.reset({ type: 'card', isDefault: false });
    this.isAddPaymentModalOpen = true;
  }

  closeAddPaymentModal(): void {
    this.isAddPaymentModalOpen = false;
  }

  addPaymentMethod(): void {
    if (this.paymentForm.valid) {
      const newPayment: PaymentMethod = {
        id: this.paymentMethods.length + 1,
        type: this.paymentForm.value.type,
        isDefault: this.paymentForm.value.isDefault
      };

      if (newPayment.type === 'card') {
        newPayment.brand = 'Visa';
        newPayment.last4 = this.paymentForm.value.cardNumber.slice(-4);
      } else {
        newPayment.email = this.user.email;
      }

      if (newPayment.isDefault) {
        this.paymentMethods.forEach(p => (p.isDefault = false));
      }

      this.paymentMethods.push(newPayment);
      this.closeAddPaymentModal();
      alert('Moyen de paiement ajouté avec succès !');
    }
  }

  openEditPaymentModal(payment: PaymentMethod): void {
    this.selectedPayment = payment;
    this.isEditPaymentModalOpen = true;
  }

  closeEditPaymentModal(): void {
    this.isEditPaymentModalOpen = false;
    this.selectedPayment = null;
  }

  updatePaymentMethod(): void {
    if (this.selectedPayment) {
      const index = this.paymentMethods.findIndex(
        p => p.id === this.selectedPayment!.id
      );
      if (index !== -1) {
        if (this.paymentForm.value.isDefault) {
          this.paymentMethods.forEach(p => (p.isDefault = false));
        }
        this.paymentMethods[index].isDefault = this.paymentForm.value.isDefault;
        this.closeEditPaymentModal();
        alert('Moyen de paiement modifié avec succès !');
      }
    }
  }

  deletePaymentMethod(paymentId: number): void {
    if (confirm('Supprimer ce moyen de paiement ?')) {
      this.paymentMethods = this.paymentMethods.filter(p => p.id !== paymentId);
      alert('Moyen de paiement supprimé');
    }
  }

  setDefaultPayment(paymentId: number): void {
    this.paymentMethods.forEach(p => {
      p.isDefault = p.id === paymentId;
    });
    alert('Moyen de paiement par défaut mis à jour');
  }

  // Naviguer vers les produits
  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  // Continuer les achats
  continueShopping(): void {
    this.router.navigate(['/']);
  }
}
