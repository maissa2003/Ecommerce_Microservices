import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; //

import { JwtInterceptor } from './modules/services/jwt.interceptor';
import { AuthGuard } from './interfaces/guards/auth.guard'; //
import { LiveMeetComponent } from './modules/sessions/live-meet/live-meet.component';

// Module Imports
import { AdminModule } from './interfaces/admin/admin.module';
import { UserModule } from './interfaces/user/user.module';
import { TrainerModule } from './interfaces/trainer/trainer.module';
import { LandingPageModule } from './interfaces/landing-page/landing-page.module';
import { SharedModule } from './interfaces/shared/shared.module';
import { AuthModule } from './interfaces/auth/auth.module';
import { ExamsBackModule } from './interfaces/exams-back/exams-back.module';
import { TrainingCoursesModule } from './modules/training-courses/training-courses.module';
import { HrModule } from './modules/hr/hr.module';
import { HrDashboardModule } from './modules/hr-dashboard/hr-dashboard.module';

// Recruitment Module Imports
import { TrainerPortalModule } from './interfaces/trainer-portal/trainer-portal.module';

@NgModule({
  declarations: [AppComponent, LiveMeetComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AdminModule,
    UserModule,
    TrainerModule,
    LandingPageModule,
    SharedModule,
    AuthModule,
    ExamsBackModule,
    TrainingCoursesModule,
    HrModule,
    HrDashboardModule,
    TrainerPortalModule
  ],
  providers: [
    AuthGuard, // ✅ ajouté
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
