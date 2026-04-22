import { Component, OnInit } from '@angular/core';
import { Partner } from '../../modules/models/partner.model';
import { PartnerService } from '../../modules/services/partner.service';

@Component({
  selector: 'app-admin-partners',
  templateUrl: './admin-partners.component.html',
  styleUrls: ['./admin-partners.component.css']
})
export class AdminPartnersComponent implements OnInit {
  partners: Partner[] = [];
  loading = false;
  message = '';

  constructor(private partnerService: PartnerService) {}

  ngOnInit(): void {
    this.loadPartners();
  }

  loadPartners(): void {
    this.loading = true;
    if (!this.message.includes('✅')) {
      this.message = '';
    }

    this.partnerService.getAllPartners().subscribe({
      next: list => {
        this.partners = list || [];
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.message = 'Cannot load partners ❌';
        this.loading = false;
      }
    });
  }

  changeStatus(
    partnerId: number,
    status: 'PENDING' | 'APPROVED' | 'SUSPENDED'
  ): void {
    this.partnerService.updatePartnerStatus(partnerId, status).subscribe({
      next: () => {
        this.message = `Status updated to ${status} ✅`;
        this.loadPartners();
      },
      error: err => {
        console.error(err);
        this.message = 'Status update failed ❌';
      }
    });
  }

  deletePartner(id?: number): void {
    if (!id) return;
    if (!confirm('Delete this partner?')) return;

    this.loading = true;

    this.partnerService.deletePartnerById(id).subscribe({
      next: () => {
        this.message = 'Partner deleted ✅';
        this.loadPartners();
      },
      error: err => {
        console.error(err);
        this.message = 'Delete failed.';
        this.loading = false;
      }
    });
  }

  trackById(index: number, p: Partner): number {
    return p.id ?? index;
  }
  exportPdf(): void {
    this.loading = true;
    this.partnerService.exportPartnersPdf().subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `partners-report-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.message = 'Export PDF failed ❌';
        this.loading = false;
      }
    });
  }
}
