import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { ExamService } from './exam.service';
import { Exam, Question, Evaluation, ExamSubmission } from '../models/exam';

describe('ExamService', () => {
  let service: ExamService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExamService]
    });
    service = TestBed.inject(ExamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getAllExams', () => {
    it('should return an Observable<Exam[]>', () => {
      const mockExams: Exam[] = [
        { id: 1, title: 'Java Exam', description: 'Test', passScore: 70 } as any
      ];

      service.getAllExams().subscribe(exams => {
        expect(exams.length).toBe(1);
        expect(exams).toEqual(mockExams);
      });

      const req = httpMock.expectOne('http://localhost:8090/api/exams/exams');
      expect(req.request.method).toBe('GET');
      req.flush(mockExams);
    });
  });

  describe('#getExamWithQuestions', () => {
    it('should combine exam and questions', done => {
      const mockExam: Exam = { id: 1, title: 'Java' } as any;
      const mockQuestions: Question[] = [{ id: 10, content: 'Q1' } as any];

      service.getExamWithQuestions(1).subscribe(result => {
        expect(result.exam.title).toBe('Java');
        expect(result.questions.length).toBe(1);
        done();
      });

      const req1 = httpMock.expectOne(
        'http://localhost:8090/api/exams/exams/1'
      );
      req1.flush(mockExam);

      const req2 = httpMock.expectOne(
        'http://localhost:8090/api/exams/exams/1/questions'
      );
      req2.flush(mockQuestions);
    });
  });

  describe('#submitExam', () => {
    it('should post submission and return result', () => {
      const submission: ExamSubmission = { examId: 1, userId: 10, answers: [] };
      const mockResult = { score: 85, passed: true };

      service.submitExam(submission).subscribe(res => {
        expect(res.score).toBe(85);
      });

      const req = httpMock.expectOne(
        'http://localhost:8090/api/exams/exams/1/submit'
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockResult);
    });
  });

  describe('#getUserEvaluations', () => {
    it('should map evaluations and extract examId if nested', () => {
      const mockRaw = [
        { id: 1, examId: 10, score: 80 },
        { id: 2, exam: { id: 20 }, score: 90 }
      ];

      service.getUserEvaluations(1).subscribe(evals => {
        expect(evals[0].examId).toBe(10);
        expect(evals[1].examId).toBe(20);
      });

      const req = httpMock.expectOne(
        'http://localhost:8090/api/exams/users/1/evaluations'
      );
      req.flush(mockRaw);
    });
  });
});
