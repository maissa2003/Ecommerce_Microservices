import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../modules/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  success = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  signup(): void {
    // Reset messages
    this.error = '';
    this.success = '';

    // Validations frontend
    if (!this.username || !this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading = true;

    this.authService
      .register(this.username, this.email, this.password, ['learner'])
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.success = '✅ Account created! Redirecting to login...';
          // ✅ Redirect vers signin après 1.5s
          setTimeout(() => {
            this.router.navigate(['/signin']);
          }, 1500);
        },
        error: err => {
          this.isLoading = false;
          // ✅ Lire le message texte correctement
          if (typeof err.error === 'string' && err.error.trim().length > 0) {
            this.error = err.error;
          } else if (err.status === 400) {
            this.error = 'Username or email already exists.';
          } else if (err.status === 0) {
            this.error = 'Cannot connect to server. Is Spring Boot running?';
          } else {
            this.error = 'Error creating account. Please try again.';
          }
        }
      });
  }
}
