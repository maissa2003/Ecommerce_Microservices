import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exam, Question, Evaluation, Certificate } from '../models/exams.model';

@Injectable({
  providedIn: 'root'
})
export class ExamsService {
  private apiUrl = 'http://localhost:8090/api/exams';
  constructor(private http: HttpClient) {}

  // ==================== EXAMS ====================
  getAllExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.apiUrl}/exams`);
  }

  getExamById(id: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.apiUrl}/exams/${id}`);
  }

  createExam(exam: Exam): Observable<Exam> {
    return this.http.post<Exam>(`${this.apiUrl}/exams`, exam);
  }

  updateExam(id: number, exam: Exam): Observable<Exam> {
    return this.http.put<Exam>(`${this.apiUrl}/exams/${id}`, exam);
  }

  deleteExam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/exams/${id}`);
  }

  // ==================== QUESTIONS ====================
  getQuestionsByExam(examId: number): Observable<Question[]> {
    return this.http.get<Question[]>(
      `${this.apiUrl}/exams/${examId}/questions`
    );
  }

  getQuestionById(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/questions/${id}`);
  }

  createQuestion(examId: number, question: Question): Observable<Question> {
    return this.http.post<Question>(
      `${this.apiUrl}/exams/${examId}/questions`,
      question
    );
  }

  updateQuestion(id: number, question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/questions/${id}`, question);
  }

  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/questions/${id}`);
  }

  checkAnswer(questionId: number, answer: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/questions/${questionId}/check?answer=${answer}`
    );
  }

  // ==================== EVALUATIONS ====================
  getAllEvaluations(): Observable<Evaluation[]> {
    console.log('Fetching evaluations from:', `${this.apiUrl}/evaluations`);
    return this.http.get<Evaluation[]>(`${this.apiUrl}/evaluations`);
  }

  getEvaluationsByExam(examId: number): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(
      `${this.apiUrl}/exams/${examId}/evaluations`
    );
  }

  getEvaluationsByUser(userId: number): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(
      `${this.apiUrl}/users/${userId}/evaluations`
    );
  }

  getPassedEvaluations(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/evaluations/passed`);
  }

  getFailedEvaluations(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/evaluations/failed`);
  }

  createEvaluation(
    examId: number,
    evaluation: Evaluation
  ): Observable<Evaluation> {
    return this.http.post<Evaluation>(
      `${this.apiUrl}/exams/${examId}/evaluations`,
      evaluation
    );
  }

  deleteEvaluation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/evaluations/${id}`);
  }

  // ==================== CERTIFICATES ====================
  getAllCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.apiUrl}/certificates`);
  }

  getCertificateById(id: number): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.apiUrl}/certificates/${id}`);
  }

  getCertificatesByUser(userId: number): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(
      `${this.apiUrl}/users/${userId}/certificates`
    );
  }

  getCertificateByEvaluation(evaluationId: number): Observable<Certificate> {
    return this.http.get<Certificate>(
      `${this.apiUrl}/evaluations/${evaluationId}/certificate`
    );
  }

  getCertificateByCode(code: string): Observable<Certificate> {
    return this.http.get<Certificate>(
      `${this.apiUrl}/certificates/code/${code}`
    );
  }

  generateCertificate(evaluationId: number): Observable<Certificate> {
    return this.http.post<Certificate>(
      `${this.apiUrl}/evaluations/${evaluationId}/certificate`,
      {}
    );
  }

  deleteCertificate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/certificates/${id}`);
  }

  verifyCertificate(code: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/certificates/verify/${code}`);
  }
}
