import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPartnersComponent } from './admin-partners.component';
import { PartnerService } from '../../modules/services/partner.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AdminPartnersComponent', () => {
  let component: AdminPartnersComponent;
  let fixture: ComponentFixture<AdminPartnersComponent>;
  let partnerServiceSpy: jasmine.SpyObj<PartnerService>;

  beforeEach(async () => {
    partnerServiceSpy = jasmine.createSpyObj('PartnerService', [
      'getAllPartners',
      'updatePartnerStatus',
      'deletePartnerById',
      'exportPartnersPdf'
    ]);

    await TestBed.configureTestingModule({
      declarations: [AdminPartnersComponent],
      providers: [{ provide: PartnerService, useValue: partnerServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPartnersComponent);
    component = fixture.componentInstance;

    partnerServiceSpy.getAllPartners.and.returnValue(
      of([
        {
          id: 1,
          companyName: 'Partner 1',
          status: 'PENDING',
          industry: 'IT',
          companyEmail: 'p1@test.com',
          phone: '123456',
          address: 'Test Addr'
        }
      ])
    );

    fixture.detectChanges();
  });

  it('should create and load partners on init', () => {
    expect(component).toBeTruthy();
    expect(partnerServiceSpy.getAllPartners).toHaveBeenCalled();
    expect(component.partners.length).toBe(1);
  });

  it('should change status successfully', () => {
    partnerServiceSpy.updatePartnerStatus.and.returnValue(
      of({
        id: 1,
        companyName: 'Partner 1',
        industry: 'IT',
        companyEmail: 'p1@test.com',
        phone: '123456',
        address: 'Test Addr',
        status: 'APPROVED'
      })
    );
    component.changeStatus(1, 'APPROVED');
    expect(partnerServiceSpy.updatePartnerStatus).toHaveBeenCalledWith(
      1,
      'APPROVED'
    );
    expect(component.message).toContain('Status updated');
  });

  it('should handle error when loading partners', () => {
    spyOn(console, 'error'); // Suppress error log in test output
    partnerServiceSpy.getAllPartners.and.returnValue(
      throwError(() => new Error('Error'))
    );
    component.loadPartners();
    expect(component.message).toContain('Cannot load partners');
    expect(console.error).toHaveBeenCalled();
  });

  it('should delete partner after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    partnerServiceSpy.deletePartnerById.and.returnValue(of(undefined));

    component.deletePartner(1);

    expect(partnerServiceSpy.deletePartnerById).toHaveBeenCalledWith(1);
    expect(component.message).toContain('Partner deleted');
  });

  it('should not delete partner if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deletePartner(1);
    expect(partnerServiceSpy.deletePartnerById).not.toHaveBeenCalled();
  });

  it('should export PDF', () => {
    const mockBlob = new Blob(['pdf-data'], { type: 'application/pdf' });
    partnerServiceSpy.exportPartnersPdf.and.returnValue(of(mockBlob));

    // Mock URL and click
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob-url');
    spyOn(window.URL, 'revokeObjectURL');

    // Mock anchor element and its click method
    const mockAnchor = {
      click: jasmine.createSpy('click'),
      href: '',
      download: '',
      setAttribute: jasmine.createSpy('setAttribute'),
      remove: jasmine.createSpy('remove')
    };
    spyOn(document, 'createElement').and.returnValue(mockAnchor as any);

    component.exportPdf();

    expect(partnerServiceSpy.exportPartnersPdf).toHaveBeenCalled();
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });
});
