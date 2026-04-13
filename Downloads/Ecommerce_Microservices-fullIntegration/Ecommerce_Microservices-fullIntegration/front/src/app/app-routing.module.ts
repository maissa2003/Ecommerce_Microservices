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
import { CategoryComponent } from './components/category/category.component';
import { ArticleCatalogComponent } from './components/article-catalog/article-catalog.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { FeedbackAdminComponent } from './components/feedback-admin/feedback-admin.component';
import { AuthGuard } from '../app/components/guards/auth.guard';
import { AdminGuard } from '../app/components/guards/admin.guard';

const routes: Routes = [
  // ── Routes publiques ──────────────────────────────────────────────
  { path: '', component: LandingPageComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'login', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'register', component: SignupComponent },
  { path: 'inscription', component: SignupComponent },

  // ── Routes admin (AuthGuard + AdminGuard) ─────────────────────────
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'admin/cart',
    component: CartComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'customers',
    component: CustomerComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'admin/customers',
    component: CustomerComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'clients',
    component: CustomerComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'admin/clients',
    component: CustomerComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'admin/feedback',
    component: FeedbackAdminComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'admin/avis',
    component: FeedbackAdminComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'admin/reviews',
    component: FeedbackAdminComponent,
    canActivate: [AuthGuard, AdminGuard]
  },

  // ── Routes client connecté (AuthGuard seulement) ──────────────────
  {
    path: 'mon-compte',
    component: CustomerDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'account',
    component: CustomerDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: CustomerDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profil',
    component: CustomerDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard-client',
    component: CustomerDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'client/dashboard',
    component: CustomerDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'espace-client',
    component: CustomerDashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'orders',
    component: OrderHistoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'orders/:id',
    component: OrderDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'feedback',
    component: FeedbackComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'avis',
    component: FeedbackComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reviews',
    component: FeedbackComponent,
    canActivate: [AuthGuard]
  },

  // ── Routes publiques catalogue ────────────────────────────────────
  { path: 'boutique', component: ArticleCatalogComponent },
  { path: 'produits', component: ArticleCatalogComponent },
  { path: 'shop', component: ArticleCatalogComponent },

  // ── Fallback ──────────────────────────────────────────────────────
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      enableTracing: false
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
