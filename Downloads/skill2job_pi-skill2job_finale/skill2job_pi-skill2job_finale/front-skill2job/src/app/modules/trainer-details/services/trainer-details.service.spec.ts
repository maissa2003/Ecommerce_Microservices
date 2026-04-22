import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TrainerDetailsService } from './trainer-details.service';

describe('TrainerDetailsService', () => {
  let service: TrainerDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TrainerDetailsService]
    });
    service = TestBed.inject(TrainerDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
