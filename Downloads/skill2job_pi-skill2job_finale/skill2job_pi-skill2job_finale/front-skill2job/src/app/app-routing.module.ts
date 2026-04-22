import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './interfaces/admin/admin.component';
import { UserComponent } from './interfaces/user/user.component';
import { TrainerComponent } from './interfaces/trainer/trainer.component';
import { LandingPageComponent } from './interfaces/landing-page/landing-page.component';
import { SigninComponent } from './interfaces/signin/signin.component';
import { SignupComponent } from './interfaces/signup/signup.component';
import { DashboardComponent } from './interfaces/shared/dashboard/dashboard.component';
import { AuthGuard } from './interfaces/guards/auth.guard';

import { ExamsComponent } from './interfaces/exams-back/exams.component';
import { ExamFormComponent } from './interfaces/exams-back/components/exam-form/exam-form.component';
import { ExamTableComponent } from './interfaces/exams-back/components/exam-table/exam-table.component';
import { QuestionFormComponent } from './interfaces/exams-back/components/question-form/question-form.component';
import { EvaluationTableComponent } from './interfaces/exams-back/components/evaluation-table/evaluation-table.component';
import { CertificateListComponent } from './interfaces/exams-back/components/certificate-list/certificate-list.component';
import { CertificateDetailsComponent } from './interfaces/exams-back/components/certificate-details/certificate-details.component';
import { CertificateGenerateComponent } from './interfaces/exams-back/components/certificate-generate/certificate-generate.component';
import { QuestionTableComponent } from './interfaces/exams-back/components/question-table/question-table.component';
import { LiveMeetComponent } from './modules/sessions/live-meet/live-meet.component';

import { TrainingCoursesComponent } from './modules/training-courses/training-courses.component';
import { CourseDetailsComponent } from './modules/training-courses/admin/course-details/course-details.component';
import { UserCoursesComponent } from './modules/training-courses/user/user-courses/user-courses.component';
import { PaymentComponent } from './modules/training-courses/payment/payment.component';
import { WalletDashboardComponent } from './modules/training-courses/wallet/wallet-dashboard/wallet-dashboard.component';
import { EnrolledCourseComponent } from './modules/training-courses/user/enrolled-course/enrolled-course.component';
import { TrainerHomeComponent } from './interfaces/trainer/trainer-home/trainer-home.component';
import { TrainerCoursesComponent } from './modules/training-courses/trainer/trainer-courses/trainer-courses.component';

// Recruitment Module Imports
import { TrainerPortalRoutingModule } from './interfaces/trainer-portal/trainer-portal-routing.module';

// HR Imports
import { HrComponent } from './modules/hr/hr.component';
import { TrainerProfilesComponent } from './modules/hr/trainer-profiles/trainer-profiles.component';
import { TrainerDetailsComponent } from './modules/hr/trainer-details/trainer-details.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },

  // ADMIN: exams, sessions, training course management (catalog + details)
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_ADMIN' },
    children: [
      {
        path: 'exams/certificates/generate/:evaluationId',
        component: CertificateGenerateComponent
      },
      {
        path: 'exams/certificates/:id',
        component: CertificateDetailsComponent
      },
      { path: 'exams/certificates', component: CertificateListComponent },
      { path: 'exams/exam-table', component: ExamTableComponent },
      { path: 'exams/exam-form', component: ExamFormComponent },
      { path: 'exams/exam-form/:id', component: ExamFormComponent },
      { path: 'exams/question-table', component: QuestionTableComponent },
      {
        path: 'exams/question-table/:examId',
        component: QuestionTableComponent
      },
      { path: 'exams/question-form', component: QuestionFormComponent },
      {
        path: 'exams/question-form/edit/:id',
        component: QuestionFormComponent
      },
      { path: 'exams/question-form/:examId', component: QuestionFormComponent },
      { path: 'exams/evaluation-table', component: EvaluationTableComponent },
      {
        path: 'exams/evaluation-table/:examId',
        component: EvaluationTableComponent
      },
      { path: 'exams', component: ExamsComponent },
      {
        path: 'sessions',
        loadChildren: () =>
          import('./modules/sessions/sessions.module').then(
            m => m.SessionsModule
          ),
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_TRAINER'] }
      },
      {
        path: 'training-courses/:id',
        component: CourseDetailsComponent,
        canActivate: [AuthGuard],
        data: { role: 'ROLE_ADMIN' }
      },
      {
        path: 'training-courses',
        component: TrainingCoursesComponent,
        canActivate: [AuthGuard],
        data: { role: 'ROLE_ADMIN' }
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { role: 'ROLE_ADMIN' }
      },
      // HR Routes
      {
        path: 'hr/applications',
        component: HrComponent,
        canActivate: [AuthGuard],
        data: { role: 'ROLE_ADMIN' }
      },
      {
        path: 'hr/trainer-profiles',
        component: TrainerProfilesComponent,
        canActivate: [AuthGuard],
        data: { role: 'ROLE_ADMIN' }
      },
      {
        path: 'hr/trainer-details',
        component: TrainerDetailsComponent,
        canActivate: [AuthGuard],
        data: { role: 'ROLE_ADMIN' }
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },

  // LEARNER: catalog, enrollment, payments, wallet + existing lazy modules
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_LEARNER', 'ROLE_ADMIN', 'ROLE_TRAINER'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'courses' },
      {
        path: 'courses/:id',
        component: EnrolledCourseComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_LEARNER', 'ROLE_ADMIN', 'ROLE_TRAINER'] }
      },
      {
        path: 'courses',
        component: UserCoursesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_LEARNER', 'ROLE_ADMIN', 'ROLE_TRAINER'] }
      },
      {
        path: 'payment',
        component: PaymentComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_LEARNER', 'ROLE_ADMIN', 'ROLE_TRAINER'] }
      },
      {
        path: 'wallet',
        component: WalletDashboardComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_LEARNER', 'ROLE_ADMIN', 'ROLE_TRAINER'] }
      },
      {
        path: 'exams',
        loadChildren: () =>
          import('./modules/exams/exams.module').then(m => m.ExamsModule)
      },
      {
        path: 'sessions',
        loadChildren: () =>
          import('./modules/sessions/sessions.module').then(
            m => m.SessionsModule
          ),
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_LEARNER', 'ROLE_ADMIN', 'ROLE_TRAINER'] }
      },
      {
        path: 'certificates',
        loadChildren: () =>
          import('./modules/certificates/certificates.module').then(
            m => m.CertificatesModule
          )
      }
    ]
  },

  // TRAINER: dashboard shell + "My courses" only (separate from admin catalog management)
  {
    path: 'trainer',
    component: TrainerComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_TRAINER' },
    children: [
      { path: '', pathMatch: 'full', component: TrainerHomeComponent },
      {
        path: 'my-courses',
        component: TrainerCoursesComponent,
        canActivate: [AuthGuard],
        data: { role: 'ROLE_TRAINER' }
      }
    ]
  },

  {
    path: 'trainer-sessions',
    loadChildren: () =>
      import('./modules/sessions/sessions.module').then(m => m.SessionsModule),
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_TRAINER'] }
  },

  {
    path: 'hr-dashboard',
    loadChildren: () =>
      import('./modules/hr-dashboard/hr-dashboard.module').then(
        m => m.HrDashboardModule
      ),
    canActivate: [AuthGuard],
    data: { role: 'ROLE_ADMIN' }
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'trainer-portal',
    loadChildren: () =>
      import('./interfaces/trainer-portal/trainer-portal.module').then(
        m => m.TrainerPortalModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'live/:sessionId/:roomCode',
    component: LiveMeetComponent,
    canActivate: [AuthGuard]
  },

  { path: '**', redirectTo: 'signin' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
