import { Component, OnInit } from '@angular/core';
import { PartnerService } from '../../modules/services/partner.service';
import { JobOfferService } from '../../modules/services/job-offer.service';
import { Partner } from '../../modules/models/partner.model';
import { JobOffer } from '../../modules/models/job-offer.model';

@Component({
  selector: 'app-partner-profile',
  templateUrl: './partner-profile.component.html',
  styleUrls: ['./partner-profile.component.scss']
})
export class PartnerProfileComponent implements OnInit {
  partner: Partner | null = null;

  form: Partner = {
    companyName: '',
    industry: '',
    companyEmail: '',
    phone: '',
    address: '',
    website: '',
    description: ''
  };

  loading = false;
  msg = '';

  constructor(private partnerService: PartnerService) {}

  ngOnInit(): void {
    this.loadPartner();
  }

  loadPartner(): void {
    this.loading = true;
    this.msg = '';

    this.partnerService.getMyPartner().subscribe({
      next: p => {
        this.partner = p;
        this.form = { ...p };
        this.loading = false;
      },
      error: err => {
        // ✅ si pas encore créé => on laisse un form vide
        this.partner = null;
        this.loading = false;

        if (err?.status === 401 || err?.status === 403) {
          this.msg =
            'Accès refusé : veuillez vous connecter en tant que Partner.';
        } else {
          this.msg = 'Aucun profil partenaire trouvé. Vous pouvez le créer.';
        }
      }
    });
  }

  save(): void {
    this.loading = true;
    this.msg = '';

    const payload = {
      companyName: this.form.companyName,
      industry: this.form.industry,
      companyEmail: this.form.companyEmail,
      phone: this.form.phone,
      address: this.form.address,
      website: this.form.website,
      description: this.form.description
    };

    const call$ = this.partner
      ? this.partnerService.updateMyPartner(payload)
      : this.partnerService.createMyPartner(payload);

    call$.subscribe({
      next: p => {
        this.partner = p;
        this.form = { ...p };
        this.msg = 'Company profile saved ✅';
        this.loading = false;
      },
      error: err => {
        this.msg = this.extractError(err);
        this.loading = false;
      }
    });
  }

  deleteMyPartner(): void {
    if (!confirm('Are you sure you want to delete your Partner Profile?'))
      return;

    this.loading = true;
    this.msg = '';

    this.partnerService.deleteMyPartner().subscribe({
      next: () => {
        this.partner = null;
        this.form = {
          companyName: '',
          industry: '',
          companyEmail: '',
          phone: '',
          address: '',
          website: '',
          description: ''
        };
        this.msg = 'Partner profile deleted ✅';
        this.loading = false;
      },
      error: err => {
        this.msg = this.extractError(err);
        this.loading = false;
      }
    });
  }

  private extractError(err: any): string {
    if (typeof err?.error === 'string' && err.error.trim().length > 0)
      return err.error;
    if (err?.error?.message) return err.error.message;

    if (err?.status === 401 || err?.status === 403) {
      return 'Accès refusé : token manquant/expiré.';
    }
    if (err?.status === 0) {
      return 'Impossible de contacter le serveur (backend éteint ou CORS).';
    }
    return 'Erreur inconnue. Veuillez réessayer.';
  }
}
