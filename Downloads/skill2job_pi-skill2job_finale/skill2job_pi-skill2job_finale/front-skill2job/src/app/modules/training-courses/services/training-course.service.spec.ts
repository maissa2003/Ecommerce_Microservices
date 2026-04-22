import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TrainingCourseService } from './training-course.service';
import { HttpEventType, HttpEvent, HttpResponse } from '@angular/common/http';

describe('TrainingCourseService', () => {
  let service: TrainingCourseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TrainingCourseService]
    });
    service = TestBed.inject(TrainingCourseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getAll', () => {
    it('should return an Observable<any[]>', () => {
      const mockCourses = [{ id: 1, title: 'Course 1' }];

      service.getAll().subscribe(courses => {
        expect(courses.length).toBe(1);
        expect(courses).toEqual(mockCourses);
      });

      const req = httpMock.expectOne(request =>
        request.url.endsWith('/training-courses')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCourses);
    });
  });

  describe('#create', () => {
    it('should handle upload progress events and return body on complete', () => {
      const courseData = { title: 'New Course' };
      const mockResponse = { id: 1, ...courseData };

      service.create(courseData).subscribe(response => {
        if (response) {
          expect(response).toEqual(mockResponse);
        }
      });

      const req = httpMock.expectOne(request =>
        request.url.endsWith('/training-courses')
      );
      expect(req.request.method).toBe('POST');

      // Simulate Progress Event
      req.event({
        type: HttpEventType.UploadProgress,
        loaded: 50,
        total: 100
      });

      // Simulate Response Event
      req.event(new HttpResponse({ body: mockResponse }));
    });
  });

  describe('#handleError', () => {
    it('should return specialized message for 413 error', () => {
      service.getAll().subscribe({
        next: () => fail('should have failed with 413'),
        error: (error: Error) => {
          expect(error.message).toBe(
            'File too large! Please select a smaller file.'
          );
        }
      });

      const req = httpMock.expectOne(request =>
        request.url.endsWith('/training-courses')
      );
      req.flush('Too Large', { status: 413, statusText: 'Payload Too Large' });
    });

    it('should return generic error message for other errors', () => {
      service.getAll().subscribe({
        next: () => fail('should have failed with 500'),
        error: (error: Error) => {
          expect(error.message).toBe('Server Error');
        }
      });

      const req = httpMock.expectOne(request =>
        request.url.endsWith('/training-courses')
      );
      req.flush('Server Error', {
        status: 500,
        statusText: 'Internal Server Error'
      });
    });
  });
});
