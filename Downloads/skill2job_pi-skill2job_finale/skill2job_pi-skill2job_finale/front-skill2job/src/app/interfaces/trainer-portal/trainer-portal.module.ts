import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TrainerPortalRoutingModule } from './trainer-portal-routing.module';
import { TrainerLayoutComponent } from './layout/trainer-layout/trainer-layout.component';
import { TrainerHomeComponent } from './pages/trainer-home/trainer-home.component';
import { TrainerApplyComponent } from './pages/trainer-apply/trainer-apply.component';
import { TrainerMyApplicationComponent } from './pages/trainer-my-application/trainer-my-application.component';
import { TrainerMyProfileComponent } from './pages/trainer-my-profile/trainer-my-profile.component';
import { TrainerHelpComponent } from './pages/trainer-help/trainer-help.component';
import { TrainerMessagesComponent } from './trainer-messages.component';
@NgModule({
  declarations: [
    TrainerLayoutComponent,
    TrainerHomeComponent,
    TrainerApplyComponent,
    TrainerMyApplicationComponent,
    TrainerMyProfileComponent,
    TrainerHelpComponent,
    TrainerMessagesComponent
  ],
  imports: [CommonModule, RouterModule, FormsModule, TrainerPortalRoutingModule]
})
export class TrainerPortalModule {}
