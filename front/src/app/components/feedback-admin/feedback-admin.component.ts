import { Component, OnInit } from '@angular/core';
import { FeedbackService, Feedback } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback-admin',
  templateUrl: './feedback-admin.component.html',
  styleUrls: ['./feedback-admin.component.css']
})
export class FeedbackAdminComponent implements OnInit {

  allFeedbacks: Feedback[] = [];
  pendingFeedbacks: Feedback[] = [];
  filteredFeedbacks: Feedback[] = [];

  activeTab: 'all' | 'pending' | 'approved' | 'rejected' = 'pending';
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  searchTerm = '';

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.loadAll();
    this.loadPending();
  }

  loadAll(): void {
    this.isLoading = true;
    this.feedbackService.getAll().subscribe({
      next: (data) => {
        this.allFeedbacks = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadPending(): void {
    this.feedbackService.getPending().subscribe({
      next: (data) => { this.pendingFeedbacks = data; },
      error: () => {}
    });
  }

  applyFilter(): void {
    let source = this.allFeedbacks;

    if (this.activeTab !== 'all') {
      source = source.filter(f => f.status?.toLowerCase() === this.activeTab);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      source = source.filter(f =>
        f.comment.toLowerCase().includes(term) ||
        f.articleId.toString().includes(term) ||
        f.userId.toString().includes(term)
      );
    }

    this.filteredFeedbacks = source;
  }

  switchTab(tab: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilter();
  }

  approve(id: number): void {
    this.feedbackService.approve(id).subscribe({
      next: () => {
        this.showSuccess('Feedback approuvé ✅');
        this.loadAll();
        this.loadPending();
      },
      error: () => this.showError('Erreur lors de l\'approbation')
    });
  }

  reject(id: number): void {
    this.feedbackService.reject(id).subscribe({
      next: () => {
        this.showSuccess('Feedback rejeté');
        this.loadAll();
        this.loadPending();
      },
      error: () => this.showError('Erreur lors du rejet')
    });
  }

  delete(id: number): void {
    if (!confirm('Confirmer la suppression définitive ?')) return;
    this.feedbackService.delete(id).subscribe({
      next: () => {
        this.showSuccess('Feedback supprimé');
        this.loadAll();
        this.loadPending();
      },
      error: () => this.showError('Erreur lors de la suppression')
    });
  }

  getStars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => i < rating ? '★' : '☆');
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'APPROVED': return 'badge-approved';
      case 'REJECTED': return 'badge-rejected';
      default: return 'badge-pending';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'APPROVED': return 'Approuvé';
      case 'REJECTED': return 'Rejeté';
      default: return 'En attente';
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  countByStatus(status: string): number {
    return this.allFeedbacks.filter(f => f.status === status).length;
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3500);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => this.errorMessage = '', 3500);
  }
}
