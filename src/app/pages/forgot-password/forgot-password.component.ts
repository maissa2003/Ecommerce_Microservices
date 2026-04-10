import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

type Step = 'email' | 'otp' | 'newPassword' | 'success';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  currentStep: Step = 'email';
  isLoading = false;
  errorMessage = '';
  userEmail = '';
  savedOtp = ''; // ✅ CORRECTION : sauvegarde l'OTP avant le changement d'étape

  emailForm: FormGroup;
  passwordForm: FormGroup;
  showPassword = false;
  showConfirm = false;

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;
  otpValues: string[] = ['', '', '', '', '', ''];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const pw  = group.get('newPassword')?.value;
    const cpw = group.get('confirmPassword')?.value;
    return pw === cpw ? null : { mismatch: true };
  }

  // ============ ÉTAPE 1 ============

  sendOtp(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.userEmail = this.emailForm.value.email;

    this.authService.forgotPassword(this.userEmail).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 'otp';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.status === 404
          ? 'Aucun compte associé à cet email.'
          : "Erreur lors de l'envoi. Réessayez.";
      }
    });
  }

  // ============ ÉTAPE 2 — OTP ============

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    const inputs = this.otpInputs.toArray();
    const input  = inputs[index].nativeElement;

    if (event.key === 'Backspace') {
      event.preventDefault();
      if (input.value) {
        input.value = '';
        this.otpValues[index] = '';
      } else if (index > 0) {
        const prev = inputs[index - 1].nativeElement;
        prev.value = '';
        this.otpValues[index - 1] = '';
        prev.focus();
      }
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputs[index - 1].nativeElement.focus();
      return;
    }

    if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      inputs[index + 1].nativeElement.focus();
      return;
    }

    if (!/^\d$/.test(event.key) && !['Tab', 'Enter'].includes(event.key)) {
      event.preventDefault();
    }
  }

  onOtpKeyup(event: KeyboardEvent, index: number): void {
    const inputs = this.otpInputs.toArray();
    const input  = inputs[index].nativeElement;
    const val    = input.value;

    if (val.length > 1) {
      input.value = val[val.length - 1];
    }

    this.otpValues[index] = input.value;

    if (input.value && index < 5) {
      inputs[index + 1].nativeElement.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6).split('');
    const inputs = this.otpInputs.toArray();

    digits.forEach((d, i) => {
      if (inputs[i]) {
        inputs[i].nativeElement.value = d;
        this.otpValues[i] = d;
      }
    });

    const lastIndex = Math.min(digits.length, 5);
    inputs[lastIndex].nativeElement.focus();
  }

  get otpValue(): string     { return this.otpInputs ? this.otpInputs.toArray().map(i => i.nativeElement.value).join('') : ''; }
  get otpComplete(): boolean { return this.otpInputs ? this.otpInputs.toArray().every(i => i.nativeElement.value !== '') : false; }

  clearOtpInputs(): void {
    if (this.otpInputs) {
      this.otpInputs.toArray().forEach(i => i.nativeElement.value = '');
    }
    this.otpValues = ['', '', '', '', '', ''];
    this.savedOtp = ''; // ✅ Réinitialiser aussi savedOtp
  }

  verifyOtp(): void {
    if (!this.otpComplete) {
      this.errorMessage = 'Veuillez entrer les 6 chiffres.';
      return;
    }
    // ✅ CORRECTION PRINCIPALE : sauvegarder l'OTP AVANT de quitter l'étape OTP
    // car *ngIf va détruire les inputs DOM et otpInputs deviendra vide
    this.savedOtp = this.otpValue;
    this.errorMessage = '';
    this.currentStep = 'newPassword';
  }

  resendOtp(): void {
    this.clearOtpInputs();
    this.errorMessage = '';
    this.sendOtp();
  }

  // ============ ÉTAPE 3 ============

  resetPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    // ✅ CORRECTION : utiliser savedOtp (string sauvegardée) et non otpValue
    // qui serait vide car les inputs DOM ont été détruits par *ngIf
    this.authService.resetPassword(
      this.userEmail,
      this.savedOtp,
      this.passwordForm.value.newPassword
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 'success';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.status === 400
          ? 'Code OTP incorrect ou expiré.'
          : 'Erreur lors de la réinitialisation.';
        this.currentStep = 'otp';
        this.clearOtpInputs();
      }
    });
  }

  // ============ NAVIGATION ============

  goToSignin(): void     { this.router.navigate(['/signin']); }
  navigateToHome(): void { this.router.navigate(['/']); }
  togglePassword(): void { this.showPassword = !this.showPassword; }
  toggleConfirm(): void  { this.showConfirm  = !this.showConfirm; }
}