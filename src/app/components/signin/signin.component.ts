import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    private router: Router
  ) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur a déjà des informations enregistrées
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.signinForm.patchValue({ email: savedEmail, rememberMe: true });
    }
  }

  onSubmit(): void {
    if (this.signinForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.signinForm.controls).forEach(key => {
        this.signinForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.signinForm.value;

    // Simuler une requête API
    setTimeout(() => {
      // Simulation de connexion réussie
      if (email === 'test@example.com' && password === 'password123') {
        // Sauvegarder l'email si "Se souvenir de moi" est coché
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Sauvegarder le token d'authentification
        localStorage.setItem('authToken', 'fake-jwt-token');
        
        // Rediriger vers la page d'accueil
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Email ou mot de passe incorrect';
      }
      this.isLoading = false;
    }, 1500);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateToSignUp(): void {
    this.router.navigate(['/signup']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  forgotPassword(): void {
    console.log('Forgot password clicked');
    // Navigation vers la page de récupération de mot de passe
    this.router.navigate(['/forgot-password']);
  }

  signInWithGoogle(): void {
    console.log('Sign in with Google');
    // Logique de connexion Google
  }

  signInWithApple(): void {
    console.log('Sign in with Apple');
    // Logique de connexion Apple
  }
}