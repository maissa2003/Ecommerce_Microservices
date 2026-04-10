import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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

  user: any = { name: '', email: '', phone: '' };

  activeTab: 'overview' | 'orders' | 'wishlist' | 'addresses' | 'settings' = 'overview';

  // Feedback utilisateur
  profileSuccess   = '';
  profileError     = '';
  passwordSuccess  = '';
  passwordError    = '';
  isSavingProfile  = false;
  isSavingPassword = false;

  orders: Order[] = [
    { id: '#ORD-001', date: '2024-03-15', status: 'delivered',  total: 299, items: 2, tracking: 'TRK123456789' },
    { id: '#ORD-002', date: '2024-03-10', status: 'shipped',    total: 129, items: 1, tracking: 'TRK987654321' },
    { id: '#ORD-003', date: '2024-03-05', status: 'processing', total: 79,  items: 1 },
    { id: '#ORD-004', date: '2024-02-28', status: 'delivered',  total: 199, items: 3 },
    { id: '#ORD-005', date: '2024-02-20', status: 'cancelled',  total: 399, items: 2 }
  ];

  wishlist: WishlistItem[] = [
    { id: 1, name: 'Smartwatch Pro',     price: 299, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop', category: 'Électronique' },
    { id: 2, name: 'Écouteurs Sans Fil', price: 129, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop', category: 'Audio' },
    { id: 3, name: 'Sac à Dos Urbain',  price: 79,  image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop', category: 'Accessoires' }
  ];

  addresses: Address[] = [
    { id: 1, type: 'home', name: '', address: '15 Rue de Paris',               city: 'Paris', postalCode: '75001', country: 'France', isDefault: true },
    { id: 2, type: 'work', name: '', address: '123 Avenue des Champs-Élysées', city: 'Paris', postalCode: '75008', country: 'France', isDefault: false }
  ];

  paymentMethods: PaymentMethod[] = [
    { id: 1, type: 'card',   brand: 'Visa', last4: '4242', isDefault: true },
    { id: 2, type: 'paypal', email: '',                    isDefault: false }
  ];

  profileForm!:  FormGroup;
  passwordForm!: FormGroup;
  addressForm!:  FormGroup;
  paymentForm!:  FormGroup;

  isAddAddressModalOpen  = false;
  isEditAddressModalOpen = false;
  selectedAddress: Address | null = null;
  isAddPaymentModalOpen  = false;
  isEditPaymentModalOpen = false;
  selectedPayment: PaymentMethod | null = null;

  totalOrders  = 0;
  totalSpent   = 0;
  activeOrders = 0;

  get avatarInitials(): string {
    if (!this.user.name) return '?';
    return this.user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRealUser();
    this.initForms();
    this.loadStatistics();
  }

  loadRealUser(): void {
    const name  = this.authService.getUserName()  || 'Utilisateur';
    const email = this.authService.getUserEmail() || '';
    this.user = { name, email, phone: '' };
    this.addresses.forEach(a => a.name = name);
    const paypal = this.paymentMethods.find(p => p.type === 'paypal');
    if (paypal) paypal.email = email;
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      name:  [this.user.name,  [Validators.required, Validators.minLength(2)]],
      email: [this.user.email, [Validators.required, Validators.email]],
      phone: [this.user.phone]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.addressForm = this.fb.group({
      type:       ['home'],
      name:       [this.user.name, [Validators.required]],
      address:    ['', [Validators.required]],
      city:       ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      country:    ['France', [Validators.required]],
      isDefault:  [false]
    });

    this.paymentForm = this.fb.group({
      type:       ['card'],
      cardNumber: [''],
      cardName:   [''],
      expiryDate: [''],
      cvv:        [''],
      isDefault:  [false]
    });
  }

  passwordMatchValidator(group: FormGroup): any {
    const np = group.get('newPassword')?.value;
    const cp = group.get('confirmPassword')?.value;
    return np === cp ? null : { mismatch: true };
  }

  loadStatistics(): void {
    this.totalOrders  = this.orders.length;
    this.totalSpent   = this.orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0);
    this.activeOrders = this.orders.filter(o => ['processing', 'shipped'].includes(o.status)).length;
  }

  setActiveTab(tab: 'overview' | 'orders' | 'wishlist' | 'addresses' | 'settings'): void {
    this.activeTab = tab;
    this.profileSuccess = this.profileError = this.passwordSuccess = this.passwordError = '';
  }

  logout(): void { this.authService.logout(); }

  // ✅ Appel API → mise à jour BD + localStorage automatiquement (via tap dans AuthService)
  updateProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }

    this.isSavingProfile = true;
    this.profileSuccess  = '';
    this.profileError    = '';

    const { name, email } = this.profileForm.value;

    this.authService.updateMyProfile(name, email).subscribe({
      next: (response) => {
        this.isSavingProfile = false;
        // ✅ Mettre à jour l'affichage avec la réponse confirmée par la BD
        this.user.name  = response.nom;
        this.user.email = response.email;
        this.profileForm.patchValue({ name: response.nom, email: response.email });
        this.profileSuccess = 'Profil mis à jour avec succès !';
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.profileError = err.error || 'Erreur lors de la mise à jour.';
      }
    });
  }

  // ✅ Appel API → vérifie l'ancien mdp en BD puis change
  changePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }

    this.isSavingPassword = true;
    this.passwordSuccess  = '';
    this.passwordError    = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changeMyPassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.isSavingPassword = false;
        this.passwordSuccess = 'Mot de passe changé avec succès !';
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isSavingPassword = false;
        this.passwordError = err.error || 'Erreur lors du changement de mot de passe.';
      }
    });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      delivered: 'Livrée', processing: 'En traitement',
      shipped: 'Expédiée', cancelled: 'Annulée'
    };
    return map[status] ?? status;
  }

  getStatusClass(status: string): string { return `status-${status}`; }

  reorder(orderId: string): void { alert(`Commande ${orderId} ajoutée au panier !`); }

  cancelOrder(orderId: string): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) { order.status = 'cancelled'; this.loadStatistics(); }
    }
  }

  viewOrderDetails(orderId: string): void { this.router.navigate(['/order', orderId]); }

  removeFromWishlist(productId: number): void {
    if (confirm('Retirer ce produit de votre liste de souhaits ?')) {
      this.wishlist = this.wishlist.filter(item => item.id !== productId);
    }
  }

  addToCart(product: WishlistItem): void { alert(`${product.name} ajouté au panier !`); }

  getAddressIcon(type: string): string {
    return type === 'home' ? '🏠' : type === 'work' ? '💼' : '📍';
  }

  openAddAddressModal(): void {
    this.addressForm.reset({ type: 'home', name: this.user.name, country: 'France', isDefault: false });
    this.isAddAddressModalOpen = true;
  }

  closeAddAddressModal(): void { this.isAddAddressModalOpen = false; }

  addAddress(): void {
    if (this.addressForm.valid) {
      const newAddress: Address = { id: Date.now(), ...this.addressForm.value };
      if (newAddress.isDefault) this.addresses.forEach(a => a.isDefault = false);
      this.addresses.push(newAddress);
      this.closeAddAddressModal();
    }
  }

  openEditAddressModal(address: Address): void {
    this.selectedAddress = address;
    this.addressForm.patchValue(address);
    this.isEditAddressModalOpen = true;
  }

  closeEditAddressModal(): void { this.isEditAddressModalOpen = false; this.selectedAddress = null; }

  updateAddress(): void {
    if (this.addressForm.valid && this.selectedAddress) {
      const idx = this.addresses.findIndex(a => a.id === this.selectedAddress!.id);
      if (idx !== -1) {
        const updated = { ...this.selectedAddress, ...this.addressForm.value };
        if (updated.isDefault) this.addresses.forEach(a => a.isDefault = false);
        this.addresses[idx] = updated;
        this.closeEditAddressModal();
      }
    }
  }

  deleteAddress(addressId: number): void {
    if (confirm('Supprimer cette adresse ?')) {
      this.addresses = this.addresses.filter(a => a.id !== addressId);
    }
  }

  setDefaultAddress(addressId: number): void {
    this.addresses.forEach(a => a.isDefault = a.id === addressId);
  }

  getPaymentIcon(type: string): string { return type === 'card' ? '💳' : 'PayPal'; }

  openAddPaymentModal(): void {
    this.paymentForm.reset({ type: 'card', isDefault: false });
    this.isAddPaymentModalOpen = true;
  }

  closeAddPaymentModal(): void { this.isAddPaymentModalOpen = false; }

  addPaymentMethod(): void {
    const newPayment: PaymentMethod = {
      id: Date.now(),
      type: this.paymentForm.value.type,
      isDefault: this.paymentForm.value.isDefault
    };
    if (newPayment.type === 'card') {
      newPayment.brand = 'Visa';
      newPayment.last4 = this.paymentForm.value.cardNumber?.slice(-4);
    } else {
      newPayment.email = this.user.email;
    }
    if (newPayment.isDefault) this.paymentMethods.forEach(p => p.isDefault = false);
    this.paymentMethods.push(newPayment);
    this.closeAddPaymentModal();
  }

  openEditPaymentModal(payment: PaymentMethod): void {
    this.selectedPayment = payment;
    this.isEditPaymentModalOpen = true;
  }

  closeEditPaymentModal(): void { this.isEditPaymentModalOpen = false; this.selectedPayment = null; }

  deletePaymentMethod(paymentId: number): void {
    if (confirm('Supprimer ce moyen de paiement ?')) {
      this.paymentMethods = this.paymentMethods.filter(p => p.id !== paymentId);
    }
  }

  setDefaultPayment(paymentId: number): void {
    this.paymentMethods.forEach(p => p.isDefault = p.id === paymentId);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  }

  continueShopping(): void { this.router.navigate(['/']); }
}