import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-partner-signup',
  templateUrl: './partner-signup.component.html',
  styleUrls: ['./partner-signup.component.css']
})
export class PartnerSignupComponent {
  loading = false;
  successMessage = '';
  errorMessage = '';

  form = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',

    companyName: '',
    industry: '',
    companyEmail: '',
    phone: '',
    address: '',
    website: '',
    description: ''
  };

  private API = 'http://localhost:8090/api';

  constructor(private http: HttpClient, private router: Router) {}

  // =========================
  // SUBMIT
  // =========================
  submit() {
    this.errorMessage = '';
    this.successMessage = '';

    // ===== VALIDATIONS =====
    if (!this.form.username || !this.form.email || !this.form.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.form.password !== this.form.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (this.form.password.length < 8) {
      this.errorMessage = 'Mot de passe minimum 8 caractères.';
      return;
    }

    this.loading = true;

    // =========================
    // 1️⃣ REGISTER
    // =========================
    this.http
      .post(
        `${this.API}/auth/register`,
        {
          username: this.form.username,
          email: this.form.email,
          password: this.form.password
        },
        { responseType: 'text' }
      )
      .subscribe({
        next: () => {
          // =========================
          // 2️⃣ LOGIN
          // =========================
          this.http
            .post<any>(`${this.API}/auth/login`, {
              username: this.form.username,
              password: this.form.password
            })
            .subscribe({
              next: loginRes => {
                // ✅ Sauvegarde token (clé utilisée par JwtInterceptor)
                localStorage.setItem('token', loginRes.token);
                localStorage.setItem('user', JSON.stringify(loginRes));

                // =========================
                // 3️⃣ CREATE PARTNER PROFILE
                // =========================
                this.http
                  .post(
                    `${this.API}/partners/me`,
                    {
                      companyName: this.form.companyName,
                      industry: this.form.industry,
                      companyEmail: this.form.companyEmail,
                      phone: this.form.phone,
                      address: this.form.address,
                      website: this.form.website,
                      description: this.form.description
                    },
                    { responseType: 'text' }
                  )
                  .subscribe({
                    next: () => {
                      this.loading = false;
                      this.successMessage =
                        'Demande partenaire envoyée. En attente de validation admin.';

                      // ✅ Redirection après 2 secondes
                      setTimeout(() => {
                        this.router.navigate(['/']);
                      }, 2000);
                    },

                    error: err => {
                      this.loading = false;
                      this.errorMessage = this.extractError(err);
                    }
                  });
              },

              error: err => {
                this.loading = false;
                this.errorMessage = this.extractError(err);
              }
            });
        },

        error: err => {
          this.loading = false;
          this.errorMessage = this.extractError(err);
        }
      });
  }

  // =========================
  // BACK BUTTON
  // =========================
  goToLanding() {
    this.router.navigate(['/']); // ou '/landing' si nécessaire
  }

  // =========================
  // ERROR HANDLER
  // =========================
  private extractError(err: any): string {
    if (typeof err?.error === 'string' && err.error.trim().length > 0) {
      return err.error;
    }

    if (err?.error?.message) {
      return err.error.message;
    }

    if (err?.status === 401 || err?.status === 403) {
      return 'Accès refusé : token manquant ou expiré. Veuillez vous reconnecter.';
    }

    if (err?.status === 0) {
      return 'Impossible de contacter le serveur.';
    }

    return 'Erreur inconnue. Veuillez réessayer.';
  }
}
