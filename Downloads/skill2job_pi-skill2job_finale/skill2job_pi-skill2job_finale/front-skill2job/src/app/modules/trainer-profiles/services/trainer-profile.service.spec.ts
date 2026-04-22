import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TrainerProfileService } from './trainer-profile.service';

describe('TrainerProfileService', () => {
  let service: TrainerProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TrainerProfileService]
    });
    service = TestBed.inject(TrainerProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
