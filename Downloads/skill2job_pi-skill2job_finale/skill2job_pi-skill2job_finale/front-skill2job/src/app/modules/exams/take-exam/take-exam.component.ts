import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ExamService } from '../../services/exam.service';
import { Exam, Question, Answer, ExamSubmission } from '../../models/exam';
import { AuthService } from '../../services/auth.service';
import {
  AntiCheatService,
  ViolationEvent
} from '../../services/anti-cheat.service';

@Component({
  selector: 'app-take-exam',
  templateUrl: './take-exam.component.html',
  styleUrls: ['./take-exam.component.scss']
})
export class TakeExamComponent implements OnInit, OnDestroy {
  exam: Exam | null = null;
  questions: Question[] = [];
  currentQuestionIndex = 0;
  answers: Answer[] = [];
  loading = true;
  submitting = false;
  timeLeft: number = 0;
  timerInterval: any;

  warningVisible = false;
  violationType = '';
  violationCount = 0;
  maxViolations = 3;
  autoSubmitCountdown: number | null = null;
  private autoSubmitInterval: any;
  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private authService: AuthService,
    private antiCheat: AntiCheatService
  ) {}

  ngOnInit(): void {
    const examId = Number(this.route.snapshot.paramMap.get('id'));
    if (examId) {
      this.loadExam(examId);
    } else {
      this.router.navigate(['/user/exams']);
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.autoSubmitInterval) clearInterval(this.autoSubmitInterval);
    this.antiCheat.stop();
    this.subs.forEach(s => s.unsubscribe());
  }

  loadExam(examId: number): void {
    this.loading = true;
    this.examService.getExamWithQuestions(examId).subscribe({
      next: (data: { exam: Exam; questions: Question[] }) => {
        this.exam = data.exam;
        this.questions = data.questions;
        console.log('EXAM DURATION:', this.exam?.duration);
        console.log('TIME LEFT SET TO:', (this.exam?.duration || 30) * 60);
        this.timeLeft = (this.exam?.duration || 30) * 60;
        this.startTimer();
        this.loading = false;
        this.initAntiCheat();
      },
      error: (err: any) => {
        console.error('Error loading exam:', err);
        this.loading = false;
        alert('Error loading exam. Please try again.');
        this.router.navigate(['/user/exams']);
      }
    });
  }

  initAntiCheat(): void {
    const user = this.authService.getCurrentUser() as any;
    const learnerId = user?.id ?? user?.userId ?? 1;
    const attemptId = this.exam!.id;

    this.antiCheat.start(attemptId, learnerId);

    this.subs.push(
      this.antiCheat.violation$.subscribe((event: ViolationEvent) => {
        this.violationType = event.type;
        this.violationCount = event.count;
        this.warningVisible = true;
      }),
      this.antiCheat.autoSubmit$.subscribe(() => {
        this.violationType = 'AUTO_SUBMIT';
        this.warningVisible = true;
        this.startAutoSubmitCountdown();
      })
    );
  }

  startAutoSubmitCountdown(): void {
    this.autoSubmitCountdown = 5;
    this.autoSubmitInterval = setInterval(() => {
      this.autoSubmitCountdown!--;
      if (this.autoSubmitCountdown! <= 0) {
        clearInterval(this.autoSubmitInterval);
        this.warningVisible = false;
        this.submitExam();
      }
    }, 1000);
  }

  onWarningDismissed(): void {
    this.warningVisible = false;
  }

  getViolationMessage(): string {
    const messages: Record<string, string> = {
      TAB_SWITCH: 'You switched tabs or minimized the window.',
      WINDOW_BLUR: 'You left the exam window.',
      COPY_PASTE: 'Copy/paste is not allowed during the exam.',
      RIGHT_CLICK: 'Right-click is disabled during the exam.',
      FULLSCREEN_EXIT: 'You exited fullscreen mode.',
      AUTO_SUBMIT:
        'Maximum violations reached. Your exam is being submitted automatically.'
    };
    return messages[this.violationType] || 'Suspicious activity detected.';
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.submitExam();
      }
    }, 1000);
  }

  get currentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  selectAnswer(option: string): void {
    const existingAnswerIndex = this.answers.findIndex(
      a => a.questionId === this.currentQuestion.id
    );
    if (existingAnswerIndex !== -1) {
      this.answers[existingAnswerIndex].selectedOption = option;
    } else {
      this.answers.push({
        questionId: this.currentQuestion.id,
        selectedOption: option
      });
    }
  }

  isAnswerSelected(option: string): boolean {
    const answer = this.answers.find(
      a => a.questionId === this.currentQuestion.id
    );
    return answer?.selectedOption === option;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1)
      this.currentQuestionIndex++;
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) this.currentQuestionIndex--;
  }

  isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  canSubmit(): boolean {
    return this.answers.length === this.questions.length;
  }

  getProgress(): number {
    return (this.answers.length / this.questions.length) * 100;
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  submitExam(): void {
    if (this.submitting) return;

    if (this.answers.length < this.questions.length) {
      const confirmSubmit = confirm(
        `You have answered ${this.answers.length} out of ${this.questions.length} questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    this.submitting = true;
    this.antiCheat.stop();
    if (this.timerInterval) clearInterval(this.timerInterval);

    const user = this.authService.getCurrentUser();
    if (!user) {
      alert('You must be logged in to submit an exam.');
      this.router.navigate(['/signin']);
      return;
    }

    const userAny = user as any;
    const userId = userAny.id ?? userAny.userId ?? 1;

    const submission: ExamSubmission = {
      examId: this.exam!.id,
      userId: userId,
      answers: this.answers
    };

    sessionStorage.setItem(
      `exam_submission_${this.exam!.id}`,
      JSON.stringify(submission)
    );

    this.examService.submitExam(submission).subscribe({
      next: (result: any) => {
        sessionStorage.setItem(
          `exam_submission_${submission.examId}`,
          JSON.stringify(submission)
        );
        alert(
          `Exam submitted! Your score: ${result.score?.toFixed(1) ?? '0'}%`
        );
        this.router.navigate(['/user/exams/result', this.exam!.id], {
          state: { submission }
        });
      },
      error: (err: any) => {
        console.error('Error submitting exam:', err);
        this.submitting = false;
        alert('Error submitting exam. Please try again.');
      }
    });
  }
}
