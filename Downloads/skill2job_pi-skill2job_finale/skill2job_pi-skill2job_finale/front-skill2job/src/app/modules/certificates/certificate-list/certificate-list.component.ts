import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { SignatureService } from '../../services/signature.service';
import { Certificate, Exam, Evaluation } from '../../models/exam';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-certificate-list',
  templateUrl: './certificate-list.component.html',
  styleUrls: ['./certificate-list.component.scss']
})
export class CertificateListComponent implements OnInit {
  certificates: Certificate[] = [];
  exams: Map<number, Exam> = new Map();
  evaluations: Evaluation[] = [];
  evaluationByCertificateId: Map<number, Evaluation> = new Map();
  evaluationById: Map<number, Evaluation> = new Map();
  evaluationByCertificateCode: Map<string, Evaluation> = new Map();
  loading = true;
  error: string | null = null;

  constructor(
    private examService: ExamService,
    private authService: AuthService,
    private signatureService: SignatureService,
    private router: Router
  ) {}

  get currentUsername(): string {
    const user = this.authService.getCurrentUser() as any;
    return user?.username || 'Learner';
  }

  get signatureImage(): string | null {
    return this.signatureService.getSignatureImage();
  }

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/signin']);
      return;
    }

    const userAny = user as any;
    let userId = userAny.id || userAny.userId;

    if (!userId) {
      console.warn(
        'No valid user ID found in auth data. Falling back to userId = 1.',
        user
      );
      userId = 1;
    }

    forkJoin({
      exams: this.examService.getAllExams(),
      evaluations: this.examService.getUserEvaluations(userId),
      certificates: this.examService.getUserCertificates(userId)
    }).subscribe({
      next: result => {
        result.exams.forEach(exam => this.exams.set(exam.id, exam));

        this.evaluations = result.evaluations || [];
        this.evaluationByCertificateId.clear();
        this.evaluationById.clear();
        this.evaluationByCertificateCode.clear();

        this.evaluations.forEach((evaluation: any) => {
          if (evaluation.certificate?.id)
            this.evaluationByCertificateId.set(
              evaluation.certificate.id,
              evaluation
            );
          if (evaluation.certificate?.certificateCode)
            this.evaluationByCertificateCode.set(
              evaluation.certificate.certificateCode,
              evaluation
            );
          if (evaluation.id != null)
            this.evaluationById.set(evaluation.id, evaluation);
        });

        (result.certificates || []).forEach((cert: any) => {
          const evId = cert.evaluation?.id ?? cert.evaluationId;
          if (evId != null && this.evaluationById.has(evId)) {
            const ev = this.evaluationById.get(evId)!;
            this.evaluationByCertificateId.set(cert.id ?? evId, ev);
            if (cert.certificateCode)
              this.evaluationByCertificateCode.set(cert.certificateCode, ev);
          }
        });

        this.certificates = result.certificates;
        this.loading = false;
      },
      error: err => {
        console.error('Error loading data:', err);
        this.error = 'Failed to load certificates';
        this.loading = false;
      }
    });
  }

  // ─── Level helpers ────────────────────────────────────────────────────────

  getCertificateLevel(cert: Certificate): 'BRONZE' | 'SILVER' | 'GOLD' {
    if (cert.level) return cert.level;
    const score = this.getCertificateScore(cert);
    if (score >= 90) return 'GOLD';
    if (score >= 70) return 'SILVER';
    return 'BRONZE';
  }

  getCertificateScore(cert: Certificate): number {
    if (cert.score != null) return cert.score;
    const evaluation = this.getEvaluationForCertificate(cert);
    return evaluation?.score ?? 0;
  }

  getLevelLabel(cert: Certificate): string {
    const level = this.getCertificateLevel(cert);
    const labels: Record<string, string> = {
      GOLD: '🥇 Gold',
      SILVER: '🥈 Silver',
      BRONZE: '🥉 Bronze'
    };
    return labels[level];
  }

  getLevelClass(cert: Certificate): string {
    return 'level-' + this.getCertificateLevel(cert).toLowerCase();
  }

  // ─── Exam helpers (unchanged) ─────────────────────────────────────────────

  getExamTitle(cert: Certificate): string {
    const anyCert = cert as any;
    const evaluation = this.getEvaluationForCertificate(cert);
    if (evaluation) {
      const exam = this.exams.get(evaluation.examId);
      if (exam) return exam.title;
    }
    if (anyCert.exam?.title) return anyCert.exam.title;
    const examId: number | undefined =
      cert.examId ?? anyCert.examId ?? anyCert.exam?.id;
    if (!examId) return 'Unknown Exam';
    const exam = this.exams.get(examId);
    if (!exam) {
      this.fetchExamDetails(examId);
      return 'Loading...';
    }
    return exam.title;
  }

  getEvaluationForCertificate(cert: Certificate): Evaluation | null {
    const anyCert = cert as any;
    if (cert.id != null && this.evaluationByCertificateId.has(cert.id))
      return this.evaluationByCertificateId.get(cert.id)!;
    const evId = anyCert.evaluation?.id ?? anyCert.evaluationId;
    if (evId != null && this.evaluationById.has(evId))
      return this.evaluationById.get(evId)!;
    if (
      cert.certificateCode &&
      this.evaluationByCertificateCode.has(cert.certificateCode)
    )
      return this.evaluationByCertificateCode.get(cert.certificateCode)!;
    return null;
  }

  getExamForCertificate(cert: Certificate): Exam | null {
    const evaluation = this.getEvaluationForCertificate(cert);
    if (evaluation) return this.exams.get(evaluation.examId) ?? null;
    const anyCert = cert as any;
    if (anyCert.exam?.title) return anyCert.exam;
    const examId: number | undefined =
      cert.examId ?? anyCert.examId ?? anyCert.exam?.id;
    if (examId != null) return this.exams.get(examId) ?? null;
    return null;
  }

  getExamPassScore(cert: Certificate): number {
    const evaluation = this.getEvaluationForCertificate(cert);
    if (evaluation) {
      const exam = this.exams.get(evaluation.examId);
      if (exam && typeof exam.passScore === 'number') return exam.passScore;
    }
    const anyCert = cert as any;
    if (anyCert.exam && typeof anyCert.exam.passScore === 'number')
      return anyCert.exam.passScore;
    const examId: number | undefined =
      cert.examId ?? anyCert.examId ?? anyCert.exam?.id;
    if (examId == null) return 0;
    const exam = this.exams.get(examId);
    return exam ? exam.passScore : 0;
  }

  fetchExamDetails(examId: number): void {
    this.examService.getExamById(examId).subscribe({
      next: exam => this.exams.set(examId, exam),
      error: err => console.error('Error fetching exam details:', err)
    });
  }

  viewCertificate(certificate: Certificate): void {
    const exam = this.getExamForCertificate(certificate);
    const id = certificate.id ?? (certificate as any).certificateCode;
    this.router.navigate(['/user/certificates', id], {
      state: { certificate, exam: exam ?? undefined }
    });
  }

  // ─── PDF Download with Level Badge ───────────────────────────────────────

  downloadCertificate(certificate: Certificate): void {
    const examTitle = this.getExamTitle(certificate);
    const passScore = this.getExamPassScore(certificate);
    const score = this.getCertificateScore(certificate);
    const level = this.getCertificateLevel(certificate);

    const doc = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ── Level color palette ──
    const levelColors: Record<string, [number, number, number]> = {
      GOLD: [255, 193, 7],
      SILVER: [176, 190, 197],
      BRONZE: [188, 120, 48]
    };
    const levelColor = levelColors[level];
    const levelEmoji: Record<string, string> = {
      GOLD: '🥇',
      SILVER: '🥈',
      BRONZE: '🥉'
    };

    // Background
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Outer border — level color
    doc.setDrawColor(...levelColor);
    doc.setLineWidth(5);
    doc.rect(25, 25, pageWidth - 50, pageHeight - 50);

    // Inner border
    doc.setDrawColor(183, 28, 28);
    doc.setLineWidth(1.5);
    doc.rect(35, 35, pageWidth - 70, pageHeight - 70);

    // ── Level badge (top-right corner) ──
    doc.setFillColor(...levelColor);
    doc.roundedRect(pageWidth - 185, 45, 150, 52, 8, 8, 'F');

    doc.setTextColor(10, 10, 10);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ACHIEVEMENT LEVEL', pageWidth - 110, 65, { align: 'center' });
    doc.setFontSize(16);
    doc.text(level, pageWidth - 110, 87, { align: 'center' });

    // ── Title ──
    doc.setTextColor(183, 28, 28);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 95, {
      align: 'center'
    });

    // ── Exam title ──
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text((examTitle || 'Unknown Exam').toUpperCase(), pageWidth / 2, 145, {
      align: 'center'
    });

    // ── Student section ──
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('This is to certify that', pageWidth / 2, 195, {
      align: 'center'
    });

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...levelColor);
    const username = this.currentUsername;
    doc.text(`Student: ${username}`, pageWidth / 2, 228, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('has successfully completed the exam', pageWidth / 2, 258, {
      align: 'center'
    });

    // ── Score bar ──
    const barX = pageWidth / 2 - 150;
    const barY = 280;
    const barW = 300;
    const barH = 16;

    doc.setFillColor(40, 40, 40);
    doc.roundedRect(barX, barY, barW, barH, 4, 4, 'F');

    doc.setFillColor(...levelColor);
    doc.roundedRect(barX, barY, (barW * score) / 100, barH, 4, 4, 'F');

    doc.setFontSize(11);
    doc.setTextColor(...levelColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`Score: ${score.toFixed(1)}%`, pageWidth / 2, barY + 30, {
      align: 'center'
    });

    doc.setFontSize(11);
    doc.setTextColor(180, 180, 180);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Passing Score Required: ${passScore}%`,
      pageWidth / 2,
      barY + 48,
      { align: 'center' }
    );

    // ── Certificate code box ──
    doc.setDrawColor(...levelColor);
    doc.setLineWidth(1.5);
    doc.roundedRect(pageWidth / 2 - 185, 348, 370, 46, 6, 6);
    doc.setFontSize(13);
    doc.setTextColor(...levelColor);
    doc.setFont('helvetica', 'bold');
    doc.text(certificate.certificateCode, pageWidth / 2, 376, {
      align: 'center'
    });

    // ── Issue date ──
    doc.setFontSize(12);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Issue Date: ${this.formatDate(certificate.issueDate)}`,
      pageWidth / 2,
      413,
      { align: 'center' }
    );

    // ── Signature: drawn image if available, otherwise text ──
    const sigImg = this.signatureImage;
    if (sigImg) {
      const imgWidth = 180;
      const imgHeight = 60;
      doc.addImage(
        sigImg,
        'PNG',
        pageWidth - imgWidth - 60,
        pageHeight - imgHeight - 90,
        imgWidth,
        imgHeight
      );
    } else {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(
        pageWidth - 230,
        pageHeight - 115,
        pageWidth - 70,
        pageHeight - 115
      );

      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('SKILL2JOB', pageWidth - 150, pageHeight - 95, {
        align: 'center'
      });
    }

    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.setFont('helvetica', 'normal');
    doc.text(`${new Date().getFullYear()}`, pageWidth - 150, pageHeight - 75, {
      align: 'center'
    });

    doc.save(`certificate-${certificate.certificateCode}.pdf`);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goToExams(): void {
    this.router.navigate(['/user/exams']);
  }
}
