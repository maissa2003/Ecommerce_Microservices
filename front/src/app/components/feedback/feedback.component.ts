import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeedbackService, Feedback, FeedbackStats } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit, OnChanges {

  @Input() articleId!: number;
  @Input() userId: number = 1; // En prod, à récupérer depuis le service d'auth

  feedbacks: Feedback[] = [];
  stats: FeedbackStats = { articleId: 0, averageRating: 0, totalApproved: 0 };

  feedbackForm: FormGroup;
  editForm: FormGroup;

  isLoading = false;
  isSubmitting = false;
  showForm = false;
  successMessage = '';
  errorMessage = '';

  editingFeedback: Feedback | null = null;
  hoveredRating = 0;
  hoveredEditRating = 0;

  constructor(
    private feedbackService: FeedbackService,
    private fb: FormBuilder
  ) {
    this.feedbackForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]]
    });

    this.editForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    if (this.articleId) {
      this.loadFeedbacks();
      this.loadStats();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['articleId'] && !changes['articleId'].firstChange) {
      this.loadFeedbacks();
      this.loadStats();
    }
  }

  loadFeedbacks(): void {
    this.isLoading = true;
    this.feedbackService.getApprovedByArticle(this.articleId).subscribe({
      next: (data) => {
        this.feedbacks = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadStats(): void {
    this.feedbackService.getStatsByArticle(this.articleId).subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: () => {}
    });
  }

  // ─── Soumission ─────────────────────────────────────────────────────────────

  submitFeedback(): void {
    if (this.feedbackForm.invalid || this.feedbackForm.value.rating === 0) {
      this.errorMessage = 'Veuillez remplir tous les champs et donner une note.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const newFeedback: Feedback = {
      articleId: this.articleId,
      userId: this.userId,
      comment: this.feedbackForm.value.comment,
      rating: this.feedbackForm.value.rating
    };

    this.feedbackService.create(newFeedback).subscribe({
      next: () => {
        this.successMessage = '✅ Votre avis a été soumis et est en attente de modération.';
        this.feedbackForm.reset({ rating: 0, comment: '' });
        this.showForm = false;
        this.isSubmitting = false;
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erreur lors de la soumission. Vous avez peut-être déjà soumis un avis.';
        this.isSubmitting = false;
      }
    });
  }

  // ─── Édition ────────────────────────────────────────────────────────────────

  startEdit(feedback: Feedback): void {
    this.editingFeedback = feedback;
    this.editForm.patchValue({ rating: feedback.rating, comment: feedback.comment });
  }

  cancelEdit(): void {
    this.editingFeedback = null;
  }

  saveEdit(): void {
    if (!this.editingFeedback?.id || this.editForm.invalid) return;

    this.isSubmitting = true;
    const updated: Feedback = {
      ...this.editingFeedback,
      comment: this.editForm.value.comment,
      rating: this.editForm.value.rating
    };

    this.feedbackService.update(this.editingFeedback.id, updated).subscribe({
      next: () => {
        this.editingFeedback = null;
        this.isSubmitting = false;
        this.loadFeedbacks();
        this.loadStats();
      },
      error: () => { this.isSubmitting = false; }
    });
  }

  deleteFeedback(id: number): void {
    if (!confirm('Supprimer cet avis ?')) return;
    this.feedbackService.delete(id).subscribe({
      next: () => {
        this.feedbacks = this.feedbacks.filter(f => f.id !== id);
        this.loadStats();
      },
      error: () => {}
    });
  }

  // ─── Étoiles ────────────────────────────────────────────────────────────────

  setRating(value: number): void {
    this.feedbackForm.patchValue({ rating: value });
  }

  setEditRating(value: number): void {
    this.editForm.patchValue({ rating: value });
  }

  getStars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? '★' : '☆');
  }

  getStarClass(index: number, currentRating: number, hovered: number): string {
    const active = hovered > 0 ? hovered : currentRating;
    return index < active ? 'star filled' : 'star';
  }

  getRatingLabel(rating: number): string {
    const labels: Record<number, string> = {
      1: 'Très mauvais', 2: 'Mauvais', 3: 'Correct', 4: 'Bien', 5: 'Excellent'
    };
    return labels[rating] || '';
  }

  getAvatarInitials(userId: number): string {
    return `U${userId}`;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  getRatingDistribution(star: number): number {
    if (this.feedbacks.length === 0) return 0;
    const count = this.feedbacks.filter(f => f.rating === star).length;
    return Math.round((count / this.feedbacks.length) * 100);
  }

  get currentRating(): number { return this.feedbackForm.value.rating || 0; }
  get currentEditRating(): number { return this.editForm.value.rating || 0; }
  get commentLength(): number { return this.feedbackForm.value.comment?.length || 0; }
}
