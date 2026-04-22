import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TrainingCoursesComponent } from './training-courses.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TrainingCoursesComponent', () => {
  let component: TrainingCoursesComponent;
  let fixture: ComponentFixture<TrainingCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TrainingCoursesComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TrainingCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
