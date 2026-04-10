import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  signinForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.redirectByRole();
      return;
    }
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.signinForm.patchValue({ email: savedEmail, rememberMe: true });
    }
  }

  onSubmit(): void {
    if (this.signinForm.invalid) {
      Object.keys(this.signinForm.controls).forEach(key =>
        this.signinForm.get(key)?.markAsTouched()
      );
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.signinForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        this.redirectByRole();
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage =
          err.status === 401
            ? 'Email ou mot de passe incorrect'
            : 'Une erreur est survenue. Veuillez réessayer.';
        this.isLoading = false;
      },
      complete: () => { this.isLoading = false; }
    });
  }

  private redirectByRole(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/mon-compte']);
    }
  }

  fillTestCredentials(): void {
    this.signinForm.patchValue({
      email: 'admin&#64;gmail.com',
      password: '12345678'
    });
  }

  togglePasswordVisibility(): void { this.showPassword = !this.showPassword; }
  navigateToSignUp(): void { this.router.navigate(['/signup']); }
  navigateToHome(): void { this.router.navigate(['/']); }
  forgotPassword(): void { this.router.navigate(['/forgot-password']); }
  signInWithGoogle(): void { console.log('Sign in with Google'); }
  signInWithApple(): void { console.log('Sign in with Apple'); }
}