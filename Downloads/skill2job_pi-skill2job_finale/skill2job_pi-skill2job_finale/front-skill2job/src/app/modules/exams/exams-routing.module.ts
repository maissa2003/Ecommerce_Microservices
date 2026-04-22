import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExamListComponent } from './exam-list/exam-list.component';
import { TakeExamComponent } from './take-exam/take-exam.component';
import { ExamResultComponent } from './exam-result/exam-result.component';

const routes: Routes = [
  { path: '', component: ExamListComponent },
  { path: 'take/:id', component: TakeExamComponent },
  { path: 'result/:id', component: ExamResultComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExamsRoutingModule {}
