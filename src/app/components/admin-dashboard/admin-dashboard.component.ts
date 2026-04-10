import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

interface Order {
  id: string;
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

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  isSidebarCollapsed = false;
  activeTab = 'overview';
  isAddUserModalOpen = false;
  isEditUserModalOpen = false;
  selectedUser: Utilisateur | null = null;
  isLoadingUsers = false;
  errorMessage = '';
  successMessage = '';

  searchTerm = '';
  filteredUsers: Utilisateur[] = [];
  users: Utilisateur[] = [];

  userForm: FormGroup;

  orderSearch = '';
  productSearch = '';

  get userName(): string {
    return this.authService.getUserName() || 'Admin';
  }

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

  orders: Order[] = [
    { id: '#ORD-001', customer: 'Sophie Martin', email: 'sophie@email.com', amount: 299, status: 'completed', date: '2024-01-15' },
    { id: '#ORD-002', customer: 'Thomas Dubois', email: 'thomas@email.com', amount: 129, status: 'processing', date: '2024-01-14' },
    { id: '#ORD-003', customer: 'Marie Laurent', email: 'marie@email.com', amount: 79, status: 'pending', date: '2024-01-14' },
    { id: '#ORD-004', customer: 'Jean Dupont', email: 'jean@email.com', amount: 199, status: 'completed', date: '2024-01-13' },
    { id: '#ORD-005', customer: 'Claire Bernard', email: 'claire@email.com', amount: 399, status: 'cancelled', date: '2024-01-12' }
  ];

  products: Product[] = [
    { id: 1, name: 'Smartwatch Pro', price: 299, stock: 45, category: 'Électronique', status: 'active' },
    { id: 2, name: 'Écouteurs Sans Fil', price: 129, stock: 120, category: 'Audio', status: 'active' },
    { id: 3, name: 'Sac à Dos Urbain', price: 79, stock: 34, category: 'Accessoires', status: 'active' },
    { id: 4, name: 'Montre Classique', price: 199, stock: 12, category: 'Accessoires', status: 'inactive' }
  ];

  recentActivities: RecentActivity[] = [
    { id: 1, user: 'Sophie Martin', action: 'a passé une commande de €299', time: 'il y a 5 minutes', type: 'sale' },
    { id: 2, user: 'Thomas Dubois', action: 's\'est inscrit sur la plateforme', time: 'il y a 1 heure', type: 'user' },
    { id: 3, user: 'Admin', action: 'a ajouté le produit "Smartwatch Pro"', time: 'il y a 3 heures', type: 'product' },
    { id: 4, user: 'Marie Laurent', action: 'a passé une commande de €79', time: 'il y a 5 heures', type: 'sale' }
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.userForm = this.fb.group({
      nom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      role: ['CUSTOMER', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/signin']);
      return;
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.errorMessage = '';

    this.userService.getAllUsers().subscribe({
      next: (data: Utilisateur[]) => {
        this.users = data;
        this.filteredUsers = data;
        this.isLoadingUsers = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        this.isLoadingUsers = false;
      }
    });
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.nom.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'customers') {
      this.loadUsers();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  openAddUserModal(): void {
    this.isAddUserModalOpen = true;
    this.errorMessage = '';
    this.userForm.reset({
      nom: '',
      email: '',
      password: '',
      role: 'CUSTOMER'
    });

    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(4)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  closeAddUserModal(): void {
    this.isAddUserModalOpen = false;
    this.userForm.reset();
    this.errorMessage = '';
  }

  openEditUserModal(user: Utilisateur): void {
    this.selectedUser = user;
    this.isEditUserModalOpen = true;
    this.errorMessage = '';

    this.userForm.patchValue({
      nom: user.nom,
      email: user.email,
      password: '',
      role: user.role
    });

    // En mode modification, le password devient optionnel
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  closeEditUserModal(): void {
    this.isEditUserModalOpen = false;
    this.selectedUser = null;
    this.userForm.reset();
    this.errorMessage = '';
  }

  addUser(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(k => {
        this.userForm.get(k)?.markAsTouched();
      });
      return;
    }

    const newUser: Utilisateur = {
      nom: this.userForm.value.nom,
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      role: this.userForm.value.role
    };

    this.userService.createUser(newUser).subscribe({
      next: (created) => {
        this.users.push(created);
        this.filteredUsers = [...this.users];
        this.successMessage = 'Utilisateur créé avec succès !';
        this.closeAddUserModal();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors de la création';
      }
    });
  }

  updateUser(): void {
    if (!this.selectedUser) {
      return;
    }

    const passwordValue = this.userForm.value.password?.trim();

    // En modification, on ignore le champ password vide
    if (
      this.userForm.get('nom')?.invalid ||
      this.userForm.get('email')?.invalid ||
      this.userForm.get('role')?.invalid
    ) {
      this.userForm.get('nom')?.markAsTouched();
      this.userForm.get('email')?.markAsTouched();
      this.userForm.get('role')?.markAsTouched();
      return;
    }

    const updated: Utilisateur = {
      id: this.selectedUser.id,
      nom: this.userForm.value.nom,
      email: this.userForm.value.email,
      role: this.userForm.value.role
    };

    // on ajoute password seulement s’il est saisi
    if (passwordValue) {
      updated.password = passwordValue;
    }

    this.userService.updateUser(this.selectedUser.id!, updated).subscribe({
      next: (user) => {
        const idx = this.users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
          this.users[idx] = user;
        }
        this.filteredUsers = [...this.users];
        this.successMessage = 'Utilisateur modifié avec succès !';
        this.closeEditUserModal();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors de la modification';
      }
    });
  }

  deleteUser(userId: number | undefined): void {
    if (!userId) return;
    if (!confirm('Supprimer cet utilisateur ?')) return;

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== userId);
        this.filteredUsers = [...this.users];
        this.successMessage = 'Utilisateur supprimé !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors de la suppression';
      }
    });
  }

  getRoleLabel(role: string): string {
    return role === 'ADMIN' ? 'Administrateur' : 'Client';
  }

  getRoleBadgeColor(role: string): string {
    return role === 'ADMIN' ? 'danger' : 'info';
  }

  openAddProductModal(): void {
    alert('Mode démo');
  }

  closeAddProductModal(): void {}

  addProduct(): void {}

  deleteProduct(id: number): void {
    alert('Mode démo');
  }

  getStatusColor(s: string): string {
    return s === 'completed'
      ? 'success'
      : s === 'processing'
      ? 'warning'
      : s === 'pending'
      ? 'info'
      : 'danger';
  }

  getStatusLabel(s: string): string {
    return s === 'completed'
      ? 'Terminée'
      : s === 'processing'
      ? 'En cours'
      : s === 'pending'
      ? 'En attente'
      : 'Annulée';
  }
}