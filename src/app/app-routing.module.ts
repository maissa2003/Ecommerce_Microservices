import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { CustomerComponent } from './components/customer/customer.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import { ProductCatalogComponent } from './components/product-catalog/product-catalog.component';
import { CartComponent } from './components/cart/cart.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';


const routes: Routes = [
  // Routes publiques
  { path: '', component: LandingPageComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'login', component: SigninComponent }, // Alias pour signin
  { path: 'signup', component: SignupComponent },
  { path: 'register', component: SignupComponent }, // Alias pour signup
  { path: 'inscription', component: SignupComponent }, // Alias français
  
  // Routes admin
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'admin/cart', component: CartComponent },
  
  // Routes clients (gestion des clients par l'admin)
  { path: 'customers', component: CustomerComponent },
  { path: 'admin/customers', component: CustomerComponent },
  { path: 'clients', component: CustomerComponent }, // Alias français
  { path: 'admin/clients', component: CustomerComponent },
  
  // Routes pour le client connecté (tableau de bord client)
  { path: 'mon-compte', component: CustomerDashboardComponent },
  { path: 'account', component: CustomerDashboardComponent },
  { path: 'profile', component: CustomerDashboardComponent },
  { path: 'profil', component: CustomerDashboardComponent },
  { path: 'dashboard-client', component: CustomerDashboardComponent },
  { path: 'client/dashboard', component: CustomerDashboardComponent },
  { path: 'espace-client', component: CustomerDashboardComponent },
    { path: 'boutique', component: ProductCatalogComponent },
  { path: 'produits', component: ProductCatalogComponent },
  { path: 'shop', component: ProductCatalogComponent },
  { path: 'cart', component: CartComponent },
  { path: 'orders', component: OrderHistoryComponent },
  { path: 'orders/:id', component: OrderDetailComponent },
  // Redirection pour les routes non trouvées
  { path: '**', redirectTo: '' },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled', // Restaure la position de défilement
    anchorScrolling: 'enabled',
    enableTracing: false // Mettre à true pour le débogage
  })],
  exports: [RouterModule],
})
export class AppRoutingModule { }