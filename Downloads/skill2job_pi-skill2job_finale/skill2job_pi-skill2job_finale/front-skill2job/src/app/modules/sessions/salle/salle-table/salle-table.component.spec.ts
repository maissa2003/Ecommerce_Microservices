import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SalleTableComponent } from './salle-table.component';
import { SalleService } from '../../../services/salle.service';
import { of } from 'rxjs';

describe('SalleTableComponent', () => {
  let component: SalleTableComponent;
  let fixture: ComponentFixture<SalleTableComponent>;
  let salleServiceSpy: jasmine.SpyObj<SalleService>;

  beforeEach(async () => {
    salleServiceSpy = jasmine.createSpyObj('SalleService', [
      'getAll',
      'delete'
    ]);
    salleServiceSpy.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        SalleTableComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [{ provide: SalleService, useValue: salleServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(SalleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
