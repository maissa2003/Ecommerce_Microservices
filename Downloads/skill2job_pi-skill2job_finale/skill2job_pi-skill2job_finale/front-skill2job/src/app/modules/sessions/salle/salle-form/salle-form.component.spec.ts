import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SalleFormComponent } from './salle-form.component';
import { SalleService } from '../../../services/salle.service';
import { BlocService } from '../../../services/blocs.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('SalleFormComponent', () => {
  let component: SalleFormComponent;
  let fixture: ComponentFixture<SalleFormComponent>;
  let salleServiceSpy: jasmine.SpyObj<SalleService>;
  let blocServiceSpy: jasmine.SpyObj<BlocService>;

  beforeEach(async () => {
    salleServiceSpy = jasmine.createSpyObj('SalleService', [
      'getById',
      'add',
      'update'
    ]);
    blocServiceSpy = jasmine.createSpyObj('BlocService', ['getAll']);

    salleServiceSpy.getById.and.returnValue(
      of({ name: '', capacity: 0, status: 'available' })
    );
    blocServiceSpy.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        SalleFormComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: SalleService, useValue: salleServiceSpy },
        { provide: BlocService, useValue: blocServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: 1 } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SalleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
