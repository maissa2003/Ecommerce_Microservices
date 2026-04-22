import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TrainerDetailsComponent } from './trainer-details.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TrainerDetailsComponent', () => {
  let component: TrainerDetailsComponent;
  let fixture: ComponentFixture<TrainerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TrainerDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TrainerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
