import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobOfferService } from '../../modules/services/job-offer.service';
import { JobOffer } from '../../modules/models/job-offer.model';
import { ApplicationService } from '../../modules/services/application.service';

@Component({
  selector: 'app-user-offer-details',
  templateUrl: './user-offer-details.component.html',
  styleUrls: ['./user-offer-details.component.scss']
})
export class UserOfferDetailsComponent implements OnInit {
  offer: JobOffer | null = null;
  loading = false;
  error = '';

  showApply = false;
  submitting = false;
  applyMessage = '';

  alreadyApplied = false;

  // ✅ NEW FILES
  cvFile!: File;
  motivationFile!: File;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: JobOfferService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || Number.isNaN(id) || id <= 0) {
      this.error = 'ID offre invalide.';
      return;
    }

    this.load(id);
    this.checkAlreadyApplied(id);
  }

  load(id: number): void {
    this.loading = true;
    this.error = '';
    this.applyMessage = '';

    this.offerService.getOfferById(id).subscribe({
      next: data => {
        this.offer = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = "Impossible de charger les détails de l'offre.";
      }
    });
  }

  back(): void {
    this.router.navigate(['/user/offers']);
  }

  getCompanyName(): string {
    if (!this.offer) return 'Entreprise';
    return (
      (this.offer as any)?.partner?.companyName ||
      (this.offer as any)?.partner?.name ||
      (this.offer as any)?.partnerName ||
      'Entreprise'
    );
  }

  toggleApply(): void {
    if (this.alreadyApplied) return;
    this.applyMessage = '';
    this.showApply = !this.showApply;
  }

  private checkAlreadyApplied(offerId: number): void {
    this.applicationService.hasApplied(offerId).subscribe({
      next: res => {
        this.alreadyApplied = !!res?.applied;
      },
      error: () => {
        this.alreadyApplied = false;
      }
    });
  }

  // ===============================
  // FILE HANDLERS
  // ===============================
  onCvSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.cvFile = file;
    } else {
      alert('CV must be a PDF file.');
    }
  }

  onMotivationSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.motivationFile = file;
    } else {
      alert('Motivation must be a PDF file.');
    }
  }

  // ===============================
  // APPLY
  // ===============================
  apply(): void {
    if (!this.offer || !this.offer.id) return;

    if (!this.cvFile || !this.motivationFile) {
      alert('Veuillez uploader CV et Motivation en PDF.');
      return;
    }

    const formData = new FormData();
    formData.append('jobOfferId', this.offer.id.toString());
    formData.append('cv', this.cvFile);
    formData.append('motivation', this.motivationFile);

    this.submitting = true;

    this.applicationService.applyWithFiles(formData).subscribe({
      next: msg => {
        this.submitting = false;
        this.applyMessage = msg || '✅ Candidature envoyée avec succès.';
        this.alreadyApplied = true;
        this.showApply = false;
      },
      error: err => {
        this.submitting = false;
        this.applyMessage = err?.error || "Erreur lors de l'envoi.";
      }
    });
  }
}
