import { Component, OnInit } from '@angular/core';
import { PartnerService } from '../../modules/services/partner.service';
import { JobOfferService } from '../../modules/services/job-offer.service';
import { Partner } from '../../modules/models/partner.model';
import { JobOffer } from '../../modules/models/job-offer.model';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent implements OnInit {
  partner: Partner | null = null;
  offers: JobOffer[] = [];

  loading = false;
  msg = '';

  editingId: number | null = null;

  form: any = {
    title: '',
    description: '',
    location: '',
    type: 'INTERNSHIP',
    mode: 'ONSITE',
    requirements: '',
    deadline: ''
  };

  constructor(
    private partnerService: PartnerService,
    private offerService: JobOfferService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.loading = true;
    this.msg = '';

    // ✅ Partner du user connecté
    this.partnerService.getMyPartner().subscribe({
      next: (p: Partner) => {
        this.partner = p;
        this.loadOffers();
      },
      error: () => {
        this.msg = "Vous n'avez pas encore de profil Partner (ou pas validé).";
        this.loading = false;
      }
    });
  }

  loadOffers(): void {
    if (!this.partner?.id) return;

    this.offerService.getOffersByPartnerId(this.partner.id).subscribe({
      next: (list: JobOffer[]) => {
        this.offers = list;
        this.loading = false;
      },
      error: () => {
        this.msg = 'Impossible de charger les offres.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (!this.partner?.id) {
      this.msg = 'Partner introuvable.';
      return;
    }

    if (!this.form.title || !this.form.description) {
      this.msg = 'Title et Description sont obligatoires.';
      return;
    }

    this.loading = true;
    this.msg = '';

    const payload = {
      partnerId: this.partner.id,
      title: this.form.title,
      description: this.form.description,
      location: this.form.location,
      type: this.form.type,
      mode: this.form.mode,
      requirements: this.form.requirements,
      deadline: this.form.deadline
    };

    if (this.editingId) {
      this.offerService.updateOffer(this.editingId, payload).subscribe({
        next: () => {
          this.resetForm();
          this.loadOffers();
        },
        error: err => {
          this.msg = this.extractError(err) || 'Update failed.';
          this.loading = false;
        }
      });
    } else {
      this.offerService.addOffer(payload).subscribe({
        next: () => {
          this.resetForm();
          this.loadOffers();
        },
        error: err => {
          this.msg = this.extractError(err) || 'Create failed.';
          this.loading = false;
        }
      });
    }
  }

  edit(o: JobOffer): void {
    this.editingId = o.id ?? null;

    this.form = {
      title: o.title ?? '',
      description: o.description ?? '',
      location: o.location ?? '',
      type: o.type ?? 'INTERNSHIP',
      mode: o.mode ?? 'ONSITE',
      requirements: o.requirements ?? '',
      deadline: o.deadline ?? ''
    };
  }

  remove(id?: number): void {
    if (!id) return;
    if (!confirm('Supprimer cette offre ?')) return;

    this.loading = true;

    this.offerService.deleteOffer(id).subscribe({
      next: () => this.loadOffers(),
      error: () => {
        this.msg = 'Delete failed.';
        this.loading = false;
      }
    });
  }

  toggleStatus(o: JobOffer): void {
    if (!o.id) return;

    const newStatus = o.status === 'CLOSED' ? 'OPEN' : 'CLOSED';
    this.loading = true;

    this.offerService.updateOfferStatus(o.id, newStatus).subscribe({
      next: () => this.loadOffers(),
      error: () => {
        this.msg = 'Status update failed.';
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form = {
      title: '',
      description: '',
      location: '',
      type: 'INTERNSHIP',
      mode: 'ONSITE',
      requirements: '',
      deadline: ''
    };
  }

  private extractError(err: any): string {
    if (typeof err?.error === 'string' && err.error.trim().length > 0)
      return err.error;
    if (err?.error?.message) return err.error.message;
    return '';
  }
}
