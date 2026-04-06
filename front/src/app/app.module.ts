import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
import { OrderManagementComponent } from './components/order-management/order-management.component';
import { ArticleCatalogComponent } from './components/article-catalog/article-catalog.component';
import { AuthInterceptor } from './auth.interceptor';

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
    CartComponent,
    OrderHistoryComponent,
    OrderDetailComponent,
    CategoryComponent,
    OrderManagementComponent,
    ArticleCatalogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }