import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Exams Components
import { ExamsComponent } from './exams.component';
import { ExamFormComponent } from './components/exam-form/exam-form.component';
import { ExamTableComponent } from './components/exam-table/exam-table.component';
import { QuestionFormComponent } from './components/question-form/question-form.component';
import { EvaluationTableComponent } from './components/evaluation-table/evaluation-table.component';
import { CertificateListComponent } from './components/certificate-list/certificate-list.component';
import { CertificateDetailsComponent } from './components/certificate-details/certificate-details.component';
import { CertificateGenerateComponent } from './components/certificate-generate/certificate-generate.component';
import { QuestionTableComponent } from './components/question-table/question-table.component';

@NgModule({
  declarations: [
    ExamsComponent,
    ExamFormComponent,
    ExamTableComponent,
    QuestionFormComponent,
    EvaluationTableComponent,
    CertificateListComponent,
    CertificateDetailsComponent,
    CertificateGenerateComponent,
    QuestionTableComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([])
  ],
  exports: [
    ExamsComponent,
    ExamFormComponent,
    ExamTableComponent,
    QuestionFormComponent,
    EvaluationTableComponent,
    CertificateListComponent,
    CertificateDetailsComponent,
    CertificateGenerateComponent,
    QuestionTableComponent
  ]
})
export class ExamsBackModule {}
