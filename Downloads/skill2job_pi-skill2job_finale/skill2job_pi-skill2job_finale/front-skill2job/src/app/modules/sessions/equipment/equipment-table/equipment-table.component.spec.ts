import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EquipmentTableComponent } from './equipment-table.component';
import { EquipmentService } from '../../../services/equipment.service';
import { NotificationService } from '../../../services/notification.service';
import { of } from 'rxjs';

describe('EquipmentTableComponent', () => {
  let component: EquipmentTableComponent;
  let fixture: ComponentFixture<EquipmentTableComponent>;
  let equipmentServiceSpy: jasmine.SpyObj<EquipmentService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    equipmentServiceSpy = jasmine.createSpyObj('EquipmentService', [
      'getAllEquipments',
      'getPhotoUrl',
      'deleteEquipment',
      'getReservations'
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error'
    ]);

    equipmentServiceSpy.getAllEquipments.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        EquipmentTableComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: EquipmentService, useValue: equipmentServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EquipmentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
