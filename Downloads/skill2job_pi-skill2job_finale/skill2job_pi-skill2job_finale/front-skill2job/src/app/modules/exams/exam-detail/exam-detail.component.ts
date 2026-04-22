import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { Exam, Question, Evaluation, Answer } from '../../models/exam';

export interface QuestionResult {
  question: Question;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
}

@Component({
  selector: 'app-exam-detail',
  templateUrl: './exam-detail.component.html',
  styleUrls: ['./exam-detail.component.scss']
})
export class ExamDetailComponent implements OnInit {
  exam: Exam | null = null;
  questions: Question[] = [];
  evaluation: Evaluation | null = null;
  questionResults: QuestionResult[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const examId = Number(this.route.snapshot.paramMap.get('id'));
    if (!examId) {
      this.router.navigate(['/user/exams']);
      return;
    }

    // DEBUG
    console.log('examId from route:', examId);
    console.log('history.state:', history.state);
    console.log('sessionStorage key:', `exam_submission_${examId}`);
    console.log(
      'sessionStorage value:',
      sessionStorage.getItem(`exam_submission_${examId}`)
    );

    const state = history.state as {
      submission?: { examId: number; userId: number; answers: Answer[] };
    };

    let submission = state?.submission;
    if (!submission) {
      const stored = sessionStorage.getItem(`exam_submission_${examId}`);
      if (stored) {
        submission = JSON.parse(stored);
      }
    }

    console.log('final submission:', submission);
    this.loadExamDetail(examId, submission);
  }

  private loadExamDetail(
    examId: number,
    submission?: { examId: number; userId: number; answers: Answer[] }
  ): void {
    this.loading = true;
    this.examService.getExamWithQuestions(examId).subscribe({
      next: data => {
        this.exam = data.exam;
        this.questions = data.questions || [];
        this.loadEvaluationAndBuildResults(examId, submission);
      },
      error: err => {
        console.error('Error loading exam:', err);
        this.error = 'Failed to load exam.';
        this.loading = false;
      }
    });
  }

  private loadEvaluationAndBuildResults(
    examId: number,
    submission?: { examId: number; userId: number; answers: Answer[] }
  ): void {
    const user = this.authService.getCurrentUser();
    const userAny = user as any;
    const userId = userAny?.id ?? userAny?.userId ?? 1;

    this.examService.getUserEvaluations(userId).subscribe({
      next: (evaluations: Evaluation[]) => {
        console.log(
          'RAW evaluations from backend:',
          JSON.stringify(evaluations)
        );
        this.evaluation = evaluations.find(e => e.examId === examId) ?? null;
        console.log('Matched evaluation:', JSON.stringify(this.evaluation));
        this.buildQuestionResults(submission);
        this.loading = false;
      },
      error: () => {
        this.buildQuestionResults(submission);
        this.loading = false;
      }
    });
  }

  private buildQuestionResults(submission?: {
    examId: number;
    userId: number;
    answers: Answer[];
  }): void {
    this.questionResults = [];
    if (!this.questions.length) return;

    // Priority 1: use live submission answers (just submitted)
    // Priority 2: use answers stored in evaluation from backend
    const evalAny = this.evaluation as any;
    const backendAnswers: any[] = evalAny?.answers ?? [];

    const hasSubmission = submission?.answers?.length;
    const hasBackendAnswers = backendAnswers.length > 0;

    console.log('submission answers:', submission?.answers);
    console.log('backend answers:', backendAnswers);

    this.questions.forEach(q => {
      let userAnswer = '—';

      if (hasSubmission) {
        const found = submission!.answers.find(
          a => Number(a.questionId) === Number(q.id)
        );
        userAnswer = found?.selectedOption ?? '—';
      } else if (hasBackendAnswers) {
        const found = backendAnswers.find(
          (a: any) => Number(a.questionId) === Number(q.id)
        );
        userAnswer = found?.selectedOption ?? '—';
      }

      const correct =
        userAnswer !== '—' &&
        this.normalizeAnswer(userAnswer) ===
          this.normalizeAnswer(q.correctAnswer);

      this.questionResults.push({
        question: q,
        userAnswer,
        correctAnswer: q.correctAnswer,
        correct
      });
    });
  }

  /**
   * Normalizes answer values so "A", "optionA", "a" all match each other.
   * Backend stores correctAnswer as "optionA", Angular sends selectedOption as "optionA".
   * This guard ensures any format mismatch is handled.
   */
  private normalizeAnswer(value: string): string {
    if (!value) return '';
    // "optionA" → "A", "optionB" → "B", etc.
    if (value.toLowerCase().startsWith('option')) {
      return value.replace(/^option/i, '').toUpperCase();
    }
    return value.toUpperCase();
  }

  /**
   * Returns human-readable display for an answer key.
   * "optionA" or "A" → "A) Creating standalone applications"
   */
  getAnswerDisplay(question: Question, answerValue: string): string {
    if (!answerValue || answerValue === '—') return answerValue;

    const q = question as any;

    // Build the option key: "A" → "optionA", "optionA" → "optionA"
    const key = answerValue.toLowerCase().startsWith('option')
      ? answerValue
      : `option${answerValue.toUpperCase()}`;

    const label = answerValue.toLowerCase().startsWith('option')
      ? answerValue.replace(/^option/i, '').toUpperCase()
      : answerValue.toUpperCase();

    if (q[key] != null) return `${label}) ${q[key]}`;

    return answerValue;
  }

  goToResults(): void {
    if (this.exam) {
      this.router.navigate(['/user/exams/result', this.exam.id]);
    } else {
      this.router.navigate(['/user/exams']);
    }
  }

  goToExams(): void {
    this.router.navigate(['/user/exams']);
  }

  get correctCount(): number {
    return this.questionResults.filter(r => r.correct).length;
  }
}
