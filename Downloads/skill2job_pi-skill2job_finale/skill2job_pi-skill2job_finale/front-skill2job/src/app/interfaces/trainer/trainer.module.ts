import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Trainer Components
import { TrainerComponent } from './trainer.component';
import { TrainerHomeComponent } from './trainer-home/trainer-home.component';

@NgModule({
  declarations: [TrainerComponent, TrainerHomeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([])
  ],
  exports: [TrainerComponent, TrainerHomeComponent]
})
export class TrainerModule {}
