import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SessionsRoutingModule } from './sessions-routing.module';

// sessions screens
import { SessionsTableComponent } from './sessions/sessions-table/sessions-table.component';
import { TrainerSessionsTableComponent } from './sessions/trainer-sessions-table/trainer-sessions-table.component';
import { LearnerSessionTableComponent } from './sessions/learner-sessions-table/learner-session-table.component';

// blocs
import { BlocsComponent } from './blocs/blocs.component';

// equipments
import { EquipmentTableComponent } from './equipment/equipment-table/equipment-table.component';
import { TrainerEquipmentTableComponent } from './equipment/trainer-equipments-table/trainer-equipments-table.component';
import { PcSearchComponent } from './equipment/pc-search/pc-search.component';

// rooms / salles
import { SalleTableComponent } from './salle/salle-table/salle-table.component';
import { SalleFormComponent } from './salle/salle-form/salle-form.component';
import { TrainerRoomsComponent } from './rooms/trainer-rooms/trainer-rooms.component';

@NgModule({
  declarations: [TrainerSessionsTableComponent, TrainerEquipmentTableComponent],
  imports: [
    CommonModule,
    FormsModule,
    SessionsTableComponent,
    BlocsComponent,
    EquipmentTableComponent,
    PcSearchComponent,
    SalleTableComponent,
    SalleFormComponent,
    TrainerRoomsComponent,
    LearnerSessionTableComponent,
    SessionsRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class SessionsModule {}
