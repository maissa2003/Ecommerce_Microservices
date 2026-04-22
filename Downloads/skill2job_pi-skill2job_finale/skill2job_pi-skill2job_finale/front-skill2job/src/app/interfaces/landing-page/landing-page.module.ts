import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Landing Page Component
import { LandingPageComponent } from './landing-page.component';

@NgModule({
  declarations: [LandingPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([])
  ],
  exports: [LandingPageComponent]
})
export class LandingPageModule {}
