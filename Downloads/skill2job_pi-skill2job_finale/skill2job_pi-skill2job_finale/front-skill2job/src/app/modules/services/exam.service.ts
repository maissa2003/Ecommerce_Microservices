import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Exam,
  Question,
  Evaluation,
  Certificate,
  ExamSubmission
} from '../models/exam';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = 'http://localhost:8090/api/exams';
  constructor(private http: HttpClient) {}

  getAllExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/exams`);
  }

  getExamById(id: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.apiUrl}/exams/${id}`);
  }

  getExamQuestions(examId: number): Observable<Question[]> {
    return this.http.get<Question[]>(
      `${this.apiUrl}/exams/${examId}/questions`
    );
  }

  getExamWithQuestions(
    examId: number
  ): Observable<{ exam: Exam; questions: Question[] }> {
    return new Observable(observer => {
      this.getExamById(examId).subscribe({
        next: exam => {
          this.getExamQuestions(examId).subscribe({
            next: questions => {
              observer.next({ exam, questions });
              observer.complete();
            },
            error: err => observer.error(err)
          });
        },
        error: err => observer.error(err)
      });
    });
  }

  // ← Single implementation: posts to backend submit endpoint
  submitExam(submission: ExamSubmission): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/exams/${submission.examId}/submit`,
      submission
    );
  }

  generateCertificate(evaluationId: number): Observable<Certificate> {
    return this.http.post<Certificate>(
      `${this.apiUrl}/evaluations/${evaluationId}/certificate`,
      {}
    );
  }

  // ← Single implementation: maps examId from nested exam.id if needed
  getUserEvaluations(userId: number): Observable<Evaluation[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/users/${userId}/evaluations`)
      .pipe(
        map(evaluations =>
          evaluations.map(e => ({
            ...e,
            examId: e.examId ?? e.exam?.id
          }))
        )
      );
  }

  getCertificateById(id: number): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.apiUrl}/certificates/${id}`);
  }

  getCertificateByEvaluation(evaluationId: number): Observable<Certificate> {
    return this.http.get<Certificate>(
      `${this.apiUrl}/evaluations/${evaluationId}/certificate`
    );
  }

  getUserCertificates(userId: number): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(
      `${this.apiUrl}/users/${userId}/certificates`
    );
  }

  verifyCertificate(code: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/certificates/verify/${code}`);
  }
}
