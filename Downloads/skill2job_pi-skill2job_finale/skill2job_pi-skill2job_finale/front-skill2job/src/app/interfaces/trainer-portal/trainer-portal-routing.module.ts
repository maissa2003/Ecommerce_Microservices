import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TrainerLayoutComponent } from './layout/trainer-layout/trainer-layout.component';
import { TrainerHomeComponent } from './pages/trainer-home/trainer-home.component';
import { TrainerApplyComponent } from './pages/trainer-apply/trainer-apply.component';
import { TrainerMyApplicationComponent } from './pages/trainer-my-application/trainer-my-application.component';
import { TrainerMyProfileComponent } from './pages/trainer-my-profile/trainer-my-profile.component';
import { TrainerHelpComponent } from './pages/trainer-help/trainer-help.component';
import { TrainerMessagesComponent } from './trainer-messages.component';
const routes: Routes = [
  {
    path: '',
    component: TrainerLayoutComponent,
    children: [
      { path: '', component: TrainerHomeComponent }, // ✅ IMPORTANT
      { path: 'apply', component: TrainerApplyComponent },
      { path: 'my-application', component: TrainerMyApplicationComponent },
      { path: 'my-profile', component: TrainerMyProfileComponent },
      { path: 'help', component: TrainerHelpComponent },
      { path: 'messages', component: TrainerMessagesComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrainerPortalRoutingModule {}
