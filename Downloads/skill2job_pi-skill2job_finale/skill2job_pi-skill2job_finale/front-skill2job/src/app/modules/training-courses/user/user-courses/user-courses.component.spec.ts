import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { UserCoursesComponent } from './user-courses.component';
import { TrainingCourseService } from '../../services/training-course.service';
import { CategoryService } from '../../servicesCategory/category.service';
import { CurrencyConversionService } from '../../servicesCurrency/currency-conversion.service';
import { AuthService } from '../../../services/auth.service';
import { PaymentService } from '../../payment/services/payment.service';
import { CourseProgressService } from '../../course-progress/services/course-progress.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UserCoursesComponent', () => {
  let component: UserCoursesComponent;
  let fixture: ComponentFixture<UserCoursesComponent>;
  let courseServiceSpy: jasmine.SpyObj<TrainingCourseService>;
  let categoryServiceSpy: jasmine.SpyObj<CategoryService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let paymentServiceSpy: jasmine.SpyObj<PaymentService>;
  let progressServiceSpy: jasmine.SpyObj<CourseProgressService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    courseServiceSpy = jasmine.createSpyObj('TrainingCourseService', [
      'getAll'
    ]);
    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getAll']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    paymentServiceSpy = jasmine.createSpyObj('PaymentService', [
      'getMyPayments'
    ]);
    progressServiceSpy = jasmine.createSpyObj('CourseProgressService', [
      'getMyProgress'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [UserCoursesComponent],
      providers: [
        { provide: TrainingCourseService, useValue: courseServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PaymentService, useValue: paymentServiceSpy },
        { provide: CourseProgressService, useValue: progressServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: CurrencyConversionService,
          useValue: { convert: (v: number) => v }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCoursesComponent);
    component = fixture.componentInstance;

    // Default mocks
    courseServiceSpy.getAll.and.returnValue(
      of([
        {
          id: 1,
          title: 'Java',
          price: 100,
          category: { id: 10, name: 'IT', description: 'IT Tech' }
        }
      ])
    );
    categoryServiceSpy.getAll.and.returnValue(
      of([{ id: 10, name: 'IT', description: 'IT Tech' }])
    );
    authServiceSpy.isLoggedIn.and.returnValue(true);
    paymentServiceSpy.getMyPayments.and.returnValue(of([]));
    progressServiceSpy.getMyProgress.and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load courses and categories on init', () => {
    expect(courseServiceSpy.getAll).toHaveBeenCalled();
    expect(categoryServiceSpy.getAll).toHaveBeenCalled();
    expect(component.courses.length).toBe(1);
  });

  it('should filter courses by category', () => {
    component.filterByCategory(10);
    expect(component.filteredCourses.length).toBe(1);

    component.filterByCategory(999); // Non-existent
    expect(component.filteredCourses.length).toBe(0);
  });

  it('should search courses by title', () => {
    component.searchQuery = 'Java';
    component.onSearch();
    expect(component.filteredCourses.length).toBe(1);

    component.searchQuery = 'C#';
    component.onSearch();
    expect(component.filteredCourses.length).toBe(0);
  });

  it('should reset all filters', () => {
    component.selectedCategoryId = 10;
    component.searchQuery = 'Java';
    component.resetAllFilters();
    expect(component.selectedCategoryId).toBeNull();
    expect(component.searchQuery).toBe('');
    expect(component.filteredCourses.length).toBe(1);
  });

  it('should navigate to payment if user is logged in but has no access', () => {
    const course = { id: 1, price: 100 };
    component.goToPayment(course, new Event('click'));
    expect(routerSpy.navigate).toHaveBeenCalledWith(
      ['/user/payment'],
      jasmine.any(Object)
    );
  });

  it('should navigate to signin if not logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);
    component.goToPayment({}, new Event('click'));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/signin']);
  });
});
