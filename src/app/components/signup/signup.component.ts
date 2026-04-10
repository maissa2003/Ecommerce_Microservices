import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';  // ← importé le service d'authentification

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signupForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],   // ← only nom, no prenom
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
      receiveNewsletter: [false]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pw  = control.get('password');
    const cpw = control.get('confirmPassword');
    if (pw && cpw && pw.value !== cpw.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      Object.keys(this.signupForm.controls).forEach(key =>
        this.signupForm.get(key)?.markAsTouched()
      );
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { nom, email, password } = this.signupForm.value;   // ← no prenom

    this.authService.register({ nom, email, password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.errorMessage = err.status === 400
          ? 'Cet email est déjà utilisé'
          : 'Une erreur est survenue. Veuillez réessayer.';
        this.isLoading = false;
      },
      complete: () => { this.isLoading = false; }
    });
  }

  togglePasswordVisibility()        { this.showPassword = !this.showPassword; }
  toggleConfirmPasswordVisibility() { this.showConfirmPassword = !this.showConfirmPassword; }
  navigateToSignIn()  { this.router.navigate(['/signin']); }
  navigateToHome()    { this.router.navigate(['/']); }
  signUpWithGoogle()  { console.log('Sign up with Google'); }
  signUpWithApple()   { console.log('Sign up with Apple'); }
}