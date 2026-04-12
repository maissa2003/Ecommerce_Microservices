import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  orders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  registrationDate: string;
  lastVisit: string;
  avatar?: string;
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  // États
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  isAddModalOpen = false;
  isEditModalOpen = false;
  isViewModalOpen = false;
  isLoading = false;
  searchTerm = '';
  selectedStatus = 'all';
  selectedSort = 'name-asc';

  // Statistiques (calculées dans le composant)
  totalCustomers = 0;
  activeCustomers = 0;
  totalOrders = 0;
  totalRevenue = 0;

  // Formulaires
  customerForm: FormGroup;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(private fb: FormBuilder, private router: Router) {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9+\-\s]{10,}$/)]
      ],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      status: ['active', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  // Charger les clients (simulation)
  loadCustomers(): void {
    this.isLoading = true;

    // Simulation d'appel API
    setTimeout(() => {
      this.customers = [
        {
          id: 1,
          name: 'Sophie Martin',
          email: 'sophie.martin@email.com',
          phone: '+33 6 12 34 56 78',
          address: '15 Rue de Paris',
          city: 'Paris',
          orders: 12,
          totalSpent: 2847,
          status: 'active',
          registrationDate: '2023-01-15',
          lastVisit: '2024-03-15',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
        },
        {
          id: 2,
          name: 'Thomas Dubois',
          email: 'thomas.dubois@email.com',
          phone: '+33 6 23 45 67 89',
          address: '8 Avenue de la République',
          city: 'Lyon',
          orders: 8,
          totalSpent: 1259,
          status: 'active',
          registrationDate: '2023-02-20',
          lastVisit: '2024-03-14',
          avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
        },
        {
          id: 3,
          name: 'Marie Laurent',
          email: 'marie.laurent@email.com',
          phone: '+33 6 34 56 78 90',
          address: '23 Boulevard Saint-Michel',
          city: 'Paris',
          orders: 15,
          totalSpent: 3478,
          status: 'active',
          registrationDate: '2022-11-10',
          lastVisit: '2024-03-12',
          avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
        },
        {
          id: 4,
          name: 'Jean Dupont',
          email: 'jean.dupont@email.com',
          phone: '+33 6 45 67 89 01',
          address: '42 Rue Victor Hugo',
          city: 'Marseille',
          orders: 5,
          totalSpent: 899,
          status: 'inactive',
          registrationDate: '2023-03-05',
          lastVisit: '2024-02-20',
          avatar: 'https://randomuser.me/api/portraits/men/4.jpg'
        },
        {
          id: 5,
          name: 'Claire Bernard',
          email: 'claire.bernard@email.com',
          phone: '+33 6 56 78 90 12',
          address: '7 Place de la Comédie',
          city: 'Bordeaux',
          orders: 20,
          totalSpent: 5249,
          status: 'active',
          registrationDate: '2022-09-18',
          lastVisit: '2024-03-10',
          avatar: 'https://randomuser.me/api/portraits/women/5.jpg'
        },
        {
          id: 6,
          name: 'Lucas Moreau',
          email: 'lucas.moreau@email.com',
          phone: '+33 6 67 89 01 23',
          address: '56 Rue Nationale',
          city: 'Lille',
          orders: 3,
          totalSpent: 449,
          status: 'inactive',
          registrationDate: '2023-04-12',
          lastVisit: '2024-02-28',
          avatar: 'https://randomuser.me/api/portraits/men/6.jpg'
        },
        {
          id: 7,
          name: 'Emma Petit',
          email: 'emma.petit@email.com',
          phone: '+33 6 78 90 12 34',
          address: '19 Cours Mirabeau',
          city: 'Aix-en-Provence',
          orders: 9,
          totalSpent: 1899,
          status: 'active',
          registrationDate: '2023-01-25',
          lastVisit: '2024-03-13',
          avatar: 'https://randomuser.me/api/portraits/women/7.jpg'
        },
        {
          id: 8,
          name: 'Hugo Robert',
          email: 'hugo.robert@email.com',
          phone: '+33 6 89 01 23 45',
          address: '34 Rue de la Paix',
          city: 'Nice',
          orders: 14,
          totalSpent: 3299,
          status: 'active',
          registrationDate: '2022-12-03',
          lastVisit: '2024-03-11',
          avatar: 'https://randomuser.me/api/portraits/men/8.jpg'
        },
        {
          id: 9,
          name: 'Julie Leroy',
          email: 'julie.leroy@email.com',
          phone: '+33 6 90 12 34 56',
          address: '12 Quai de la Fosse',
          city: 'Nantes',
          orders: 6,
          totalSpent: 1249,
          status: 'active',
          registrationDate: '2023-06-18',
          lastVisit: '2024-03-09',
          avatar: 'https://randomuser.me/api/portraits/women/9.jpg'
        },
        {
          id: 10,
          name: 'Antoine Girard',
          email: 'antoine.girard@email.com',
          phone: '+33 6 01 23 45 67',
          address: '78 Rue de Strasbourg',
          city: 'Toulouse',
          orders: 11,
          totalSpent: 2150,
          status: 'active',
          registrationDate: '2023-07-22',
          lastVisit: '2024-03-08',
          avatar: 'https://randomuser.me/api/portraits/men/10.jpg'
        },
        {
          id: 11,
          name: 'Camille Rousseau',
          email: 'camille.rousseau@email.com',
          phone: '+33 6 12 34 56 78',
          address: '45 Rue de la Liberté',
          city: 'Strasbourg',
          orders: 4,
          totalSpent: 699,
          status: 'inactive',
          registrationDate: '2023-08-05',
          lastVisit: '2024-02-15',
          avatar: 'https://randomuser.me/api/portraits/women/11.jpg'
        },
        {
          id: 12,
          name: 'Nicolas Mercier',
          email: 'nicolas.mercier@email.com',
          phone: '+33 6 23 45 67 89',
          address: '9 Avenue Jean Jaurès',
          city: 'Montpellier',
          orders: 17,
          totalSpent: 4120,
          status: 'active',
          registrationDate: '2022-10-14',
          lastVisit: '2024-03-07',
          avatar: 'https://randomuser.me/api/portraits/men/12.jpg'
        }
      ];

      this.updateStatistics();
      this.applyFilters();
      this.isLoading = false;
    }, 500);
  }

  // Mettre à jour les statistiques
  updateStatistics(): void {
    this.totalCustomers = this.customers.length;
    this.activeCustomers = this.customers.filter(
      c => c.status === 'active'
    ).length;
    this.totalOrders = this.customers.reduce((sum, c) => sum + c.orders, 0);
    this.totalRevenue = this.customers.reduce(
      (sum, c) => sum + c.totalSpent,
      0
    );
  }

  // Appliquer les filtres et le tri
  applyFilters(): void {
    let filtered = [...this.customers];

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        customer =>
          customer.name.toLowerCase().includes(term) ||
          customer.email.toLowerCase().includes(term) ||
          customer.phone.includes(term) ||
          customer.city.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(
        customer => customer.status === this.selectedStatus
      );
    }

    // Tri
    switch (this.selectedSort) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'orders-desc':
        filtered.sort((a, b) => b.orders - a.orders);
        break;
      case 'total-desc':
        filtered.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case 'date-desc':
        filtered.sort(
          (a, b) =>
            new Date(b.registrationDate).getTime() -
            new Date(a.registrationDate).getTime()
        );
        break;
    }

    this.filteredCustomers = filtered;
    this.totalPages = Math.ceil(
      this.filteredCustomers.length / this.itemsPerPage
    );
    this.currentPage = 1;
  }

  // Obtenir les clients de la page courante
  getPaginatedCustomers(): Customer[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredCustomers.slice(start, end);
  }

  // Obtenir les numéros de page à afficher
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

  // Obtenir le début de la plage d'affichage
  getStartRange(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  // Obtenir la fin de la plage d'affichage
  getEndRange(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.filteredCustomers.length
      ? this.filteredCustomers.length
      : end;
  }

  // Changer de page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Changer le nombre d'éléments par page
  changeItemsPerPage(event: any): void {
    this.itemsPerPage = parseInt(event.target.value);
    this.totalPages = Math.ceil(
      this.filteredCustomers.length / this.itemsPerPage
    );
    this.currentPage = 1;
  }

  // Recherche
  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  // Filtre par statut
  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  // Tri
  sortBy(sort: string): void {
    this.selectedSort = sort;
    this.applyFilters();
  }

  // Reset des filtres
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.selectedSort = 'name-asc';
    this.applyFilters();
  }

  // Ouvrir modal d'ajout
  openAddModal(): void {
    this.customerForm.reset({ status: 'active' });
    this.isAddModalOpen = true;
  }

  // Fermer modal d'ajout
  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.customerForm.reset();
  }

  // Ajouter un client
  addCustomer(): void {
    if (this.customerForm.valid) {
      const newCustomer: Customer = {
        id: this.customers.length + 1,
        name: this.customerForm.value.name,
        email: this.customerForm.value.email,
        phone: this.customerForm.value.phone,
        address: this.customerForm.value.address,
        city: this.customerForm.value.city,
        orders: 0,
        totalSpent: 0,
        status: this.customerForm.value.status,
        registrationDate: new Date().toISOString().split('T')[0],
        lastVisit: new Date().toISOString().split('T')[0]
      };

      this.customers.unshift(newCustomer);
      this.updateStatistics();
      this.applyFilters();
      this.closeAddModal();
      alert('Client ajouté avec succès !');
    } else {
      Object.keys(this.customerForm.controls).forEach(key => {
        this.customerForm.get(key)?.markAsTouched();
      });
    }
  }

  // Ouvrir modal d'édition
  openEditModal(customer: Customer): void {
    this.selectedCustomer = customer;
    this.customerForm.patchValue({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      status: customer.status
    });
    this.isEditModalOpen = true;
  }

  // Fermer modal d'édition
  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedCustomer = null;
    this.customerForm.reset();
  }

  // Modifier un client
  updateCustomer(): void {
    if (this.customerForm.valid && this.selectedCustomer) {
      const index = this.customers.findIndex(
        c => c.id === this.selectedCustomer!.id
      );
      if (index !== -1) {
        this.customers[index] = {
          ...this.customers[index],
          name: this.customerForm.value.name,
          email: this.customerForm.value.email,
          phone: this.customerForm.value.phone,
          address: this.customerForm.value.address,
          city: this.customerForm.value.city,
          status: this.customerForm.value.status
        };
        this.updateStatistics();
        this.applyFilters();
        this.closeEditModal();
        alert('Client modifié avec succès !');
      }
    } else {
      Object.keys(this.customerForm.controls).forEach(key => {
        this.customerForm.get(key)?.markAsTouched();
      });
    }
  }

  // Ouvrir modal de visualisation
  openViewModal(customer: Customer): void {
    this.selectedCustomer = customer;
    this.isViewModalOpen = true;
  }

  // Fermer modal de visualisation
  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedCustomer = null;
  }

  // Supprimer un client
  deleteCustomer(customerId: number): void {
    if (
      confirm(
        'Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.'
      )
    ) {
      this.customers = this.customers.filter(c => c.id !== customerId);
      this.updateStatistics();
      this.applyFilters();
      alert('Client supprimé avec succès !');
    }
  }

  // Formater le prix
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  // Obtenir la classe CSS pour le statut
  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      default:
        return '';
    }
  }

  // Obtenir le libellé du statut
  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      default:
        return status;
    }
  }

  // Naviguer vers les commandes du client
  viewCustomerOrders(customerId: number): void {
    this.router.navigate(['/orders'], { queryParams: { customerId } });
  }
}
