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

  // ✅ Filtre par date
  dateFilter: 'all' | 'today' | '7days' | '30days' = 'all';

  // ✅ Bulk actions
  selectedIds: Set<number> = new Set();
  selectAll = false;

  // ✅ Note admin
  editingNoteId: number | null = null;
  adminNoteText = '';

  // ✅ Stats globales
  globalStats: any = null;
  showStats = false;

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    this.loadAll();
    this.loadPending();
    this.loadGlobalStats();
  }

  // ─── Chargement ─────────────────────────────────────────────────────────────

  loadAll(): void {
    this.isLoading = true;
    this.feedbackService.getAll().subscribe({
      next: data => {
        this.allFeedbacks = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadPending(): void {
    this.feedbackService.getPending().subscribe({
      next: data => {
        this.pendingFeedbacks = data;
      },
      error: () => {}
    });
  }

  // ✅ Stats globales
  loadGlobalStats(): void {
    this.feedbackService.getGlobalStats().subscribe({
      next: data => {
        this.globalStats = data;
      },
      error: () => {}
    });
  }

  // ─── Filtres ────────────────────────────────────────────────────────────────

  applyFilter(): void {
    let source = [...this.allFeedbacks];

    // Filtre par onglet statut
    if (this.activeTab === 'pending') {
      source = source.filter(
        f => !f.status || f.status?.toLowerCase() === 'pending'
      );
    } else if (this.activeTab !== 'all') {
      source = source.filter(f => f.status?.toLowerCase() === this.activeTab);
    }

    // ✅ Filtre par date
    if (this.dateFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (this.dateFilter === 'today') {
        cutoff.setHours(0, 0, 0, 0);
      } else if (this.dateFilter === '7days') {
        cutoff.setDate(now.getDate() - 7);
      } else if (this.dateFilter === '30days') {
        cutoff.setDate(now.getDate() - 30);
      }
      source = source.filter(
        f => f.createdAt && new Date(f.createdAt) >= cutoff
      );
    }

    // Filtre par recherche texte
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      source = source.filter(
        f =>
          f.comment.toLowerCase().includes(term) ||
          f.articleId.toString().includes(term) ||
          f.userId.toString().includes(term)
      );
    }

    this.filteredFeedbacks = source;
    // Reset sélection après filtre
    this.selectedIds.clear();
    this.selectAll = false;
  }

  switchTab(tab: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilter();
  }

  // ✅ Filtre date
  setDateFilter(filter: 'all' | 'today' | '7days' | '30days'): void {
    this.dateFilter = filter;
    this.applyFilter();
  }

  // ─── Actions individuelles ──────────────────────────────────────────────────

  approve(id: number): void {
    this.feedbackService.approve(id).subscribe({
      next: () => {
        this.showSuccess('Feedback approuvé ✅');
        this.loadAll();
        this.loadPending();
        this.loadGlobalStats();
      },
      error: () => this.showError("Erreur lors de l'approbation")
    });
  }

  reject(id: number): void {
    this.feedbackService.reject(id).subscribe({
      next: () => {
        this.showSuccess('Feedback rejeté');
        this.loadAll();
        this.loadPending();
        this.loadGlobalStats();
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
        this.loadGlobalStats();
      },
      error: () => this.showError('Erreur lors de la suppression')
    });
  }

  // ─── ✅ Actions en lot (Bulk) ────────────────────────────────────────────────

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.filteredFeedbacks.forEach(f => this.selectedIds.add(f.id!));
    } else {
      this.selectedIds.clear();
    }
  }

  toggleSelect(id: number): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.selectAll = this.selectedIds.size === this.filteredFeedbacks.length;
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  get selectedCount(): number {
    return this.selectedIds.size;
  }

  bulkApprove(): void {
    if (this.selectedIds.size === 0) return;
    const ids = Array.from(this.selectedIds) as number[];
    this.feedbackService.bulkApprove(ids).subscribe({
      next: (res: any) => {
        this.showSuccess(`✅ ${res.approved} feedback(s) approuvés`);
        this.selectedIds.clear();
        this.loadAll();
        this.loadPending();
        this.loadGlobalStats();
      },
      error: () => this.showError("Erreur lors de l'approbation en lot")
    });
  }

  bulkReject(): void {
    if (this.selectedIds.size === 0) return;
    const ids = Array.from(this.selectedIds) as number[];
    this.feedbackService.bulkReject(ids).subscribe({
      next: (res: any) => {
        this.showSuccess(`❌ ${res.rejected} feedback(s) rejetés`);
        this.selectedIds.clear();
        this.loadAll();
        this.loadPending();
        this.loadGlobalStats();
      },
      error: () => this.showError('Erreur lors du rejet en lot')
    });
  }

  bulkDelete(): void {
    if (this.selectedIds.size === 0) return;
    if (
      !confirm(
        `Supprimer définitivement ${this.selectedIds.size} feedback(s) ?`
      )
    )
      return;
    const ids = Array.from(this.selectedIds) as number[];
    this.feedbackService.bulkDelete(ids).subscribe({
      next: (res: any) => {
        this.showSuccess(`🗑️ ${res.deleted} feedback(s) supprimés`);
        this.selectedIds.clear();
        this.loadAll();
        this.loadPending();
        this.loadGlobalStats();
      },
      error: () => this.showError('Erreur lors de la suppression en lot')
    });
  }

  // ─── ✅ Note admin ────────────────────────────────────────────────────────────

  startEditNote(fb: Feedback): void {
    this.editingNoteId = fb.id!;
    this.adminNoteText = fb.adminNote || '';
  }

  cancelEditNote(): void {
    this.editingNoteId = null;
    this.adminNoteText = '';
  }

  saveAdminNote(id: number): void {
    this.feedbackService.addAdminNote(id, this.adminNoteText).subscribe({
      next: (updated: Feedback) => {
        const idx = this.allFeedbacks.findIndex(f => f.id === id);
        if (idx !== -1) this.allFeedbacks[idx].adminNote = updated.adminNote;
        this.applyFilter();
        this.editingNoteId = null;
        this.showSuccess('Note enregistrée 📝');
      },
      error: () => this.showError('Erreur lors de la sauvegarde de la note')
    });
  }

  // ─── ✅ Export CSV ────────────────────────────────────────────────────────────

  exportCSV(): void {
    const headers = [
      'ID',
      'Article',
      'Utilisateur',
      'Note',
      'Commentaire',
      'Statut',
      'Note Admin',
      'Date'
    ];
    const rows = this.filteredFeedbacks.map(fb => [
      fb.id,
      `Art. #${fb.articleId}`,
      `User #${fb.userId}`,
      fb.rating,
      `"${(fb.comment || '').replace(/"/g, '""')}"`,
      this.getStatusLabel(fb.status),
      `"${(fb.adminNote || '').replace(/"/g, '""')}"`,
      this.formatDate(fb.createdAt)
    ]);

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join(
      '\n'
    );
    const bom = '\uFEFF'; // UTF-8 BOM pour Excel
    const blob = new Blob([bom + csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedbacks_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.showSuccess('📥 Export CSV téléchargé');
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  getStars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆'));
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'APPROVED':
        return 'badge-approved';
      case 'REJECTED':
        return 'badge-rejected';
      default:
        return 'badge-pending';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'APPROVED':
        return 'Approuvé';
      case 'REJECTED':
        return 'Rejeté';
      default:
        return 'En attente';
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  countByStatus(status: string): number {
    return this.allFeedbacks.filter(f => f.status === status).length;
  }

  getRatingBarWidth(star: number): number {
    if (!this.globalStats?.ratingDistribution) return 0;
    const total = this.globalStats.approved || 1;
    return Math.round(
      (this.globalStats.ratingDistribution[star] / total) * 100
    );
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = ''), 3500);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => (this.errorMessage = ''), 3500);
  }
}
