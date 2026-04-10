import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { CustomerComponent } from './components/customer/customer.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import { ProductCatalogComponent } from './components/product-catalog/product-catalog.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { AdminGuard } from './components/guards/admin.guard';
import { AuthGuard } from './components/guards/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    SigninComponent,
    SignupComponent,
    AdminDashboardComponent,
    CustomerComponent,
    CustomerDashboardComponent,
    ProductCatalogComponent,
    ForgotPasswordComponent
    // ❌ AdminGuard et AuthGuard retirés — les guards ne sont PAS des composants
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AdminGuard,  // ✅ Les guards vont dans providers
    AuthGuard    // ✅ Les guards vont dans providers
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }