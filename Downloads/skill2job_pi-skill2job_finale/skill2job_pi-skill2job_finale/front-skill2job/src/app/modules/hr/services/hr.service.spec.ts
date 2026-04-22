import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HrService } from './hr.service';

describe('HrService', () => {
  let service: HrService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HrService]
    });
    service = TestBed.inject(HrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
