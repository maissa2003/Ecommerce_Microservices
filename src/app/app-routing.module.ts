import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { CustomerComponent } from './components/customer/customer.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import { ProductCatalogComponent } from './components/product-catalog/product-catalog.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { AuthGuard } from './components/guards/auth.guard';
import { AdminGuard } from './components/guards/admin.guard';

const routes: Routes = [
  // Publiques
  { path: '',                component: LandingPageComponent },
  { path: 'signin',          component: SigninComponent },
  { path: 'signup',          component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Admin (protégé)
  { path: 'admin',           component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: 'customers',       component: CustomerComponent,       canActivate: [AdminGuard] },

  // Espace client (protégé)
  { path: 'mon-compte',         component: CustomerDashboardComponent, canActivate: [AuthGuard] },
  { path: 'customer-dashboard', component: CustomerDashboardComponent, canActivate: [AuthGuard] },

  // Boutique (publique ou protégée selon ton besoin)
  { path: 'boutique', component: ProductCatalogComponent },
  { path: 'produits', component: ProductCatalogComponent },

  // Fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    enableTracing: false
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }