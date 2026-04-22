import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SessionsTableComponent } from './sessions/sessions-table/sessions-table.component';
import { TrainerSessionsTableComponent } from './sessions/trainer-sessions-table/trainer-sessions-table.component';
import { LearnerSessionTableComponent } from './sessions/learner-sessions-table/learner-session-table.component';
import { BlocsComponent } from './blocs/blocs.component';
import { EquipmentTableComponent } from './equipment/equipment-table/equipment-table.component';
import { PcSearchComponent } from './equipment/pc-search/pc-search.component';
import { SalleTableComponent } from './salle/salle-table/salle-table.component';
import { SalleFormComponent } from './salle/salle-form/salle-form.component';
import { TrainerRoomsComponent } from './rooms/trainer-rooms/trainer-rooms.component';

const routes: Routes = [
  { path: '', component: SessionsTableComponent }, // default admin sessions page
  { path: 'trainer', component: TrainerSessionsTableComponent }, // trainer-specific view
  { path: 'learner', component: LearnerSessionTableComponent }, // learner-specific view
  { path: 'equipments', component: EquipmentTableComponent }, // /admin/sessions/equipments
  { path: 'rooms/add', component: SalleFormComponent }, // /admin/sessions/rooms/add
  { path: 'rooms/edit/:id', component: SalleFormComponent }, // /admin/sessions/rooms/edit/:id
  { path: 'rooms', component: SalleTableComponent }, // /admin/sessions/rooms
  { path: 'blocs', component: BlocsComponent }, // /admin/sessions/blocs
  { path: 'pcsearch', component: PcSearchComponent }, // /admin/sessions/pcsearch
  { path: 'virtual-rooms', component: TrainerRoomsComponent } // /admin/sessions/virtual-rooms
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionsRoutingModule {}
