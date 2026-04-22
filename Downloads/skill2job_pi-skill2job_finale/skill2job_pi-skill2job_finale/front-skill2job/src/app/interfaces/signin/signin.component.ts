import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, JwtResponse } from '../../modules/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  username = '';
  password = '';
  error = '';
  isLoading = false; // ✅ pour bloquer le double clic

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    if (!this.username || !this.password) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (res: JwtResponse) => {
        this.isLoading = false;
        console.log('✅ Login success - FULL RESPONSE:', res);
        console.log('✅ Token from response:', res.token);
        console.log('✅ Roles from response:', res.roles);

        // ✅ Sauvegarder le token
        this.authService.saveToken(res.token, res);

        // ✅ VERIFY it was saved
        console.log('✅ Token after save:', localStorage.getItem('token'));
        console.log('✅ User after save:', localStorage.getItem('user'));

        // ✅ Redirection selon le rôle
        const role = res.roles[0];
        console.log('✅ Redirecting with role:', role);

        switch (role) {
          case 'ROLE_ADMIN':
            this.router.navigate(['/admin']);
            break;
          case 'ROLE_TRAINER':
            this.router.navigate(['/trainer']);
            break;
          case 'ROLE_LEARNER':
            this.router.navigate(['/user']);
            break;
          case 'ROLE_PARTNER':
            this.router.navigate(['/partner']);
            break;
          default:
            this.router.navigate(['/signin']);
            break;
        }
      },

      error: err => {
        this.isLoading = false;
        console.error('❌ Login error:', err);
        this.error = "Nom d'utilisateur ou mot de passe incorrect.";
      }
    });
  }
}
