import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// HR Components
import { HrComponent } from './hr.component';
import { TrainerProfilesComponent } from './trainer-profiles/trainer-profiles.component';
import { TrainerDetailsComponent } from './trainer-details/trainer-details.component';

@NgModule({
  declarations: [
    HrComponent,
    TrainerProfilesComponent,
    TrainerDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([])
  ],
  exports: [HrComponent, TrainerProfilesComponent, TrainerDetailsComponent]
})
export class HrModule {}
