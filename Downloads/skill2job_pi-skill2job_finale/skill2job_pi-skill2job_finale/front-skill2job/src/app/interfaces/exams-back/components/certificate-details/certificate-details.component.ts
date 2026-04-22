import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamsService } from '../../services/exams.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-certificate-details',
  templateUrl: './certificate-details.component.html',
  styleUrls: ['./certificate-details.component.scss']
})
export class CertificateDetailsComponent implements OnInit {
  certificateId: number | null = null;
  certificate: any = null;
  loading = false;
  errorMessage = '';
  issuedToName = '';

  private apiBase = 'http://localhost:8090';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examsService: ExamsService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.certificateId = Number(this.route.snapshot.params['id']);

    if (!this.certificateId) {
      this.errorMessage = 'Certificate ID is required';
      return;
    }

    this.loadCertificate();
  }

  loadCertificate(): void {
    this.loading = true;
    this.errorMessage = '';

    this.examsService.getCertificateById(this.certificateId!).subscribe({
      next: data => {
        this.certificate = data;
        this.loading = false;
        this.loadUserName();
      },
      error: error => {
        console.error('Error loading certificate:', error);
        this.errorMessage = 'Failed to load certificate details';
        this.loading = false;
      }
    });
  }

  loadUserName(): void {
    const userId =
      this.certificate?.evaluation?.userId ?? this.certificate?.userId;
    if (!userId) {
      this.issuedToName = 'Unknown user';
      return;
    }

    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('access_token') ||
      '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .get<any>(`${this.apiBase}/api/admin/users/${userId}`, { headers })
      .subscribe({
        next: user => (this.issuedToName = user.username),
        error: () => (this.issuedToName = 'Unknown user')
      });
  }

  goBack(): void {
    this.router.navigate(['/admin/exams/certificates']);
  }

  downloadCertificate(): void {
    // Create a printable version
    const printContent = document.getElementById('certificate-print');
    const WindowPrt = window.open('', '', 'width=900,height=650');
    if (WindowPrt && printContent) {
      WindowPrt.document.write(`
        <html>
          <head>
            <title>Certificate #${this.certificate?.certificateCode}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .certificate { border: 2px solid #d32f2f; padding: 40px; text-align: center; }
              h1 { color: #d32f2f; }
              .code { font-size: 18px; color: #666; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
    }
  }

  verifyCertificate(): void {
    if (this.certificate?.certificateCode) {
      this.examsService
        .verifyCertificate(this.certificate.certificateCode)
        .subscribe({
          next: isValid => {
            if (isValid) {
              alert('✅ Certificate is valid!');
            } else {
              alert('❌ Certificate is invalid!');
            }
          },
          error: error => {
            console.error('Error verifying certificate:', error);
            alert('Failed to verify certificate');
          }
        });
    }
  }
}
