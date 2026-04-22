import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TrainerProfilesComponent } from './trainer-profiles.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TrainerProfilesComponent', () => {
  let component: TrainerProfilesComponent;
  let fixture: ComponentFixture<TrainerProfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TrainerProfilesComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TrainerProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
