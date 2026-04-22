import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { SignatureService } from '../../services/signature.service';
import {
  Certificate,
  Exam,
  Evaluation,
  Question,
  Answer
} from '../../models/exam';
import jsPDF from 'jspdf';

export interface QuestionResult {
  question: Question;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
}

@Component({
  selector: 'app-certificate-view',
  templateUrl: './certificate-view.component.html',
  styleUrls: ['./certificate-view.component.scss']
})
export class CertificateViewComponent implements OnInit {
  certificate: Certificate | null = null;
  exam: Exam | null = null;
  evaluation: Evaluation | null = null; // ← was missing
  questions: Question[] = []; // ← was missing
  questionResults: QuestionResult[] = []; // ← was missing
  loading = true;
  error: string | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private authService: AuthService,
    private signatureService: SignatureService
  ) {}

  ngOnInit(): void {
    this.loadCertificateData();
  }

  private loadCertificateData(): void {
    const state = history.state as { certificate?: Certificate; exam?: Exam };

    if (state?.certificate) {
      this.certificate = state.certificate;
      if (state.exam) {
        this.exam = state.exam;
        this.loadQuestionsAndEvaluation(state.exam.id);
        return;
      }
      this.loadExamDetailsFromCertificate(state.certificate);
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    const certificateId = idParam ? Number(idParam) : null;

    if (!certificateId || isNaN(certificateId)) {
      this.error = 'Invalid certificate ID.';
      this.loading = false;
      return;
    }

    this.examService.getCertificateById(certificateId).subscribe({
      next: cert => {
        this.certificate = cert;
        this.loadExamDetailsFromCertificate(cert);
      },
      error: () => {
        this.error = 'Failed to load certificate.';
        this.loading = false;
      }
    });
  }

  get currentUsername(): string {
    const user = this.authService.getCurrentUser() as any;
    if (user?.username) {
      return user.username;
    }
    if (this.certificate?.userId != null) {
      return `User #${this.certificate.userId}`;
    }
    return 'Learner';
  }

  get signatureText(): string {
    return this.signatureService.getSignature();
  }

  get signatureImage(): string | null {
    return this.signatureService.getSignatureImage();
  }

  private loadExamDetailsFromCertificate(cert: Certificate): void {
    const anyCert = cert as any;
    const examId: number | undefined =
      cert.examId ?? anyCert.examId ?? anyCert.exam?.id;

    if (!examId) {
      this.resolveExamFromEvaluations(cert);
      return;
    }

    this.loadExamAndQuestions(examId);
  }

  private resolveExamFromEvaluations(cert: Certificate): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.error = 'Failed to load exam details.';
      this.loading = false;
      return;
    }

    const userAny = user as any;
    const userId = userAny.id ?? userAny.userId ?? 1;

    this.examService.getUserEvaluations(userId).subscribe({
      next: (evaluations: Evaluation[]) => {
        const match = evaluations.find(
          (ev: any) =>
            ev.certificate?.id === cert.id ||
            ev.certificate?.certificateCode === cert.certificateCode
        );

        if (match?.examId) {
          this.evaluation = match;
          this.loadExamAndQuestions(match.examId);
        } else {
          this.error = 'Failed to load exam details.';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Failed to load exam details.';
        this.loading = false;
      }
    });
  }

  private loadExamAndQuestions(examId: number): void {
    this.examService.getExamWithQuestions(examId).subscribe({
      next: data => {
        this.exam = data.exam;
        this.questions = data.questions || [];
        this.loadEvaluationAndBuildResults(examId);
      },
      error: () => {
        this.error = 'Failed to load exam details.';
        this.loading = false;
      }
    });
  }

  private loadQuestionsAndEvaluation(examId: number): void {
    this.examService.getExamWithQuestions(examId).subscribe({
      next: data => {
        this.questions = data.questions || [];
        this.loadEvaluationAndBuildResults(examId);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadEvaluationAndBuildResults(examId: number): void {
    if (this.evaluation) {
      this.buildQuestionResults();
      this.loading = false;
      return;
    }

    const user = this.authService.getCurrentUser();
    const userAny = user as any;
    const userId = userAny?.id ?? userAny?.userId ?? 1;

    this.examService.getUserEvaluations(userId).subscribe({
      next: (evaluations: Evaluation[]) => {
        this.evaluation = evaluations.find(e => e.examId === examId) ?? null;
        this.buildQuestionResults();
        this.loading = false;
      },
      error: () => {
        this.buildQuestionResults();
        this.loading = false;
      }
    });
  }

  private buildQuestionResults(): void {
    this.questionResults = [];
    if (!this.questions.length) return;

    const evalAny = this.evaluation as any;
    const submittedAnswers: Answer[] =
      evalAny?.answers ??
      evalAny?.userAnswers ??
      evalAny?.submission?.answers ??
      [];

    this.questions.forEach(q => {
      const userAnswerObj = submittedAnswers.find(
        (a: Answer) => a.questionId === q.id
      );
      const userAnswer = userAnswerObj?.selectedOption ?? '—';
      const correct = userAnswer !== '—' && userAnswer === q.correctAnswer;

      this.questionResults.push({
        question: q,
        userAnswer,
        correctAnswer: q.correctAnswer,
        correct
      });
    });
  }

  get correctCount(): number {
    // ← was missing
    return this.questionResults.filter(r => r.correct).length;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  downloadPDF(): void {
    if (!this.certificate || !this.exam) return;

    const doc = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Red main border
    doc.setDrawColor(194, 43, 51);
    doc.setLineWidth(3);
    doc.rect(40, 40, pageWidth - 80, pageHeight - 80);

    const centerX = pageWidth / 2;

    // Title
    doc.setTextColor(194, 43, 51);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF ACHIEVEMENT', centerX, 100, { align: 'center' });

    // Exam title
    doc.setTextColor(17, 17, 17);
    doc.setFontSize(20);
    doc.text(this.exam.title.toUpperCase(), centerX, 140, { align: 'center' });

    // Awarded text
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text('This is to certify that', centerX, 180, { align: 'center' });

    const username = this.currentUsername;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 17, 17);
    doc.text(username, centerX, 210, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text('has successfully completed the exam', centerX, 235, {
      align: 'center'
    });

    // Required score line
    doc.setTextColor(120, 120, 120);
    doc.text(`Passing score required: ${this.exam.passScore}%`, centerX, 265, {
      align: 'center'
    });

    // Certificate code box
    doc.setDrawColor(194, 43, 51);
    doc.setLineWidth(1.5);
    const boxWidth = 360;
    const boxX = centerX - boxWidth / 2;
    const boxY = 300;
    doc.roundedRect(boxX, boxY, boxWidth, 50, 6, 6);
    doc.setFontSize(13);
    doc.setTextColor(194, 43, 51);
    doc.setFont('helvetica', 'bold');
    doc.text(this.certificate.certificateCode, centerX, boxY + 32, {
      align: 'center'
    });

    // Issue date
    doc.setFontSize(11);
    doc.setTextColor(90, 90, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Issue Date: ${this.formatDate(this.certificate.issueDate)}`,
      centerX,
      boxY + 80,
      { align: 'center' }
    );

    const sigImg = this.signatureImage;
    if (sigImg) {
      const imgWidth = 180;
      const imgHeight = 60;
      doc.addImage(
        sigImg,
        'PNG',
        pageWidth - imgWidth - 80,
        pageHeight - imgHeight - 80,
        imgWidth,
        imgHeight
      );
    } else {
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.line(
        pageWidth - 260,
        pageHeight - 90,
        pageWidth - 80,
        pageHeight - 90
      );

      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.text(this.signatureText, pageWidth - 170, pageHeight - 72, {
        align: 'center'
      });
    }
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.currentYear}`, pageWidth - 170, pageHeight - 52, {
      align: 'center'
    });

    doc.save(`certificate-${this.exam.title.replace(/\s+/g, '-')}.pdf`);
  }

  goBack(): void {
    this.router.navigate(['/user/certificates']);
  }
}
