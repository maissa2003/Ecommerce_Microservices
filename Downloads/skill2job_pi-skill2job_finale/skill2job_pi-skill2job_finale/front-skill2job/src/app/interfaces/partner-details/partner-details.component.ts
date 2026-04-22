import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartnerService } from '../../modules/services/partner.service';
import { JobOfferService } from '../../modules/services/job-offer.service';
import { Partner } from '../../modules/models/partner.model';
import { JobOffer } from '../../modules/models/job-offer.model';

@Component({
  selector: 'app-partner-details',
  templateUrl: './partner-details.component.html',
  styleUrls: ['./partner-details.component.scss']
})
export class PartnerDetailsComponent implements OnInit {
  partnerId!: number;

  partner: Partner | null = null;
  offers: JobOffer[] = [];

  loading = false;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private partnerService: PartnerService,
    private offerService: JobOfferService
  ) {}

  ngOnInit(): void {
    this.partnerId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.partnerId) {
      this.message = 'Invalid partner id.';
      return;
    }
    this.load();
  }

  load(): void {
    this.loading = true;
    this.message = '';
    this.partner = null;
    this.offers = [];

    // ✅ 1) Charger le partner par ID
    this.partnerService.getPartnerById(this.partnerId).subscribe({
      next: p => {
        this.partner = p;

        // ✅ 2) Charger ses offres par partnerId (p.id)
        // (important : partnerId = p.id)
        if (!p.id) {
          this.loading = false;
          return;
        }

        this.offerService.getOffersByPartnerId(p.id).subscribe({
          next: list => {
            this.offers = list || [];
            this.loading = false;
          },
          error: () => {
            this.message = 'Cannot load offers.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.message = 'Partner not found.';
        this.loading = false;
      }
    });
  }
}
