import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ExamListComponent } from './exam-list/exam-list.component';
import { TakeExamComponent } from './take-exam/take-exam.component';
import { ExamResultComponent } from './exam-result/exam-result.component';
import { ExamDetailComponent } from './exam-detail/exam-detail.component';

const routes: Routes = [
  { path: '', component: ExamListComponent },
  { path: 'take/:id', component: TakeExamComponent },
  { path: 'result/:id', component: ExamResultComponent },
  { path: 'detail/:id', component: ExamDetailComponent }
];

@NgModule({
  declarations: [
    ExamListComponent,
    TakeExamComponent,
    ExamResultComponent,
    ExamDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ExamsModule {}
