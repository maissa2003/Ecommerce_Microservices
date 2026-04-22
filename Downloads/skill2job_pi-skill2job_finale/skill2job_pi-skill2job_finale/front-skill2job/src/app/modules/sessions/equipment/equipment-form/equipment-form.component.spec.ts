import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EquipmentFormComponent } from './equipment-form.component';
import { EquipmentService } from '../../../services/equipment.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('EquipmentFormComponent', () => {
  let component: EquipmentFormComponent;
  let fixture: ComponentFixture<EquipmentFormComponent>;
  let equipmentServiceSpy: jasmine.SpyObj<EquipmentService>;

  beforeEach(async () => {
    equipmentServiceSpy = jasmine.createSpyObj('EquipmentService', [
      'getById',
      'add',
      'addWithPhoto',
      'updateWithPhoto',
      'getPhotoUrl'
    ]);
    equipmentServiceSpy.getById.and.returnValue(of({ name: '', quantity: 0 }));

    await TestBed.configureTestingModule({
      imports: [
        EquipmentFormComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: EquipmentService, useValue: equipmentServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: 1 } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EquipmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
