import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Components
import { TrainingCoursesComponent } from './training-courses.component';
import { CourseDetailsComponent } from './admin/course-details/course-details.component';
import { SafeUrlPipe } from './admin/course-details/safe-url.pipe';
import { UserCoursesComponent } from './user/user-courses/user-courses.component';
import { PaymentComponent } from './payment/payment.component';
import { WalletDashboardComponent } from './wallet/wallet-dashboard/wallet-dashboard.component';
import { EnrolledCourseComponent } from './user/enrolled-course/enrolled-course.component';
import { TrainerCoursesComponent } from './trainer/trainer-courses/trainer-courses.component';

@NgModule({
  declarations: [
    TrainingCoursesComponent,
    CourseDetailsComponent,
    SafeUrlPipe,
    UserCoursesComponent,
    PaymentComponent,
    WalletDashboardComponent,
    EnrolledCourseComponent,
    TrainerCoursesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([])
  ],
  exports: [
    TrainingCoursesComponent,
    CourseDetailsComponent,
    SafeUrlPipe,
    UserCoursesComponent,
    PaymentComponent,
    WalletDashboardComponent,
    EnrolledCourseComponent,
    TrainerCoursesComponent
  ]
})
export class TrainingCoursesModule {}
