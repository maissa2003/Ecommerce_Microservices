import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

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

  private keycloakUrl = 'http://localhost:9090/realms/microservices/protocol/openid-connect/token';
  private clientId = 'api-gateway';
  private clientSecret = 'ztCWfaHmPTKf9SXPNGI4XjeEN8eLHa6c';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.signinForm.patchValue({ email: savedEmail, rememberMe: true });
    }
  }

  onSubmit(): void {
    if (this.signinForm.invalid) {
      Object.keys(this.signinForm.controls).forEach(key => {
        this.signinForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.signinForm.value;

    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', this.clientId)
      .set('client_secret', this.clientSecret)
      .set('username', email)
      .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    this.http.post<any>(this.keycloakUrl, body.toString(), { headers }).subscribe({
      next: (response) => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);

        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage = 'Email ou mot de passe incorrect';
        this.isLoading = false;
      }
    });
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
    this.router.navigate(['/forgot-password']);
  }

  signInWithGoogle(): void {
    console.log('Sign in with Google');
  }

  signInWithApple(): void {
    console.log('Sign in with Apple');
  }
}