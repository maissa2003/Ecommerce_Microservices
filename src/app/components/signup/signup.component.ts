import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

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
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
      receiveNewsletter: [false]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Initialisation
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { fullName, email, password, receiveNewsletter } = this.signupForm.value;

    // Simuler une requête API d'inscription
    setTimeout(() => {
      // Simulation d'inscription réussie
      if (email !== 'existing@example.com') {
        // Sauvegarder les informations utilisateur
        localStorage.setItem('userName', fullName);
        localStorage.setItem('userEmail', email);
        
        // Sauvegarder le token d'authentification
        localStorage.setItem('authToken', 'fake-jwt-token');
        
        // Rediriger vers la page d'accueil
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Cet email est déjà utilisé';
      }
      this.isLoading = false;
    }, 1500);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  navigateToSignIn(): void {
    this.router.navigate(['/signin']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  forgotPassword(): void {
    console.log('Forgot password clicked');
    this.router.navigate(['/forgot-password']);
  }

  signUpWithGoogle(): void {
    console.log('Sign up with Google');
    // Logique d'inscription Google
  }

  signUpWithApple(): void {
    console.log('Sign up with Apple');
    // Logique d'inscription Apple
  }
}