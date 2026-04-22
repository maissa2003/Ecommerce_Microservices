import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Shared Components
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LoaderComponent } from './loader/loader.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    SidebarComponent,
    NavbarComponent,
    LoaderComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([])
  ],
  exports: [
    SidebarComponent,
    NavbarComponent,
    LoaderComponent,
    DashboardComponent
  ]
})
export class SharedModule {}
