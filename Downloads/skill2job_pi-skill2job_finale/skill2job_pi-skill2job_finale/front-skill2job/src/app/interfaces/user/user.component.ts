import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../modules/services/auth.service'; // ✅ import AuthService

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  isProfileMenuOpen = false;
  currentUser: any = null; // ✅ null par défaut, chargé depuis le token

  constructor(
    public router: Router,
    private authService: AuthService // ✅ injection
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout(); // ✅ appel au service pour effacer le token
    this.closeProfileMenu();
    this.router.navigate(['/login']);
  }

  scrollTo(section: string): void {
    this.closeProfileMenu();
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  }

  loadUserData(): void {
    // ✅ Charger les infos depuis le token stocké
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
    } else {
      // Si pas connecté → rediriger vers login
      this.router.navigate(['/login']);
    }
  }

  getInitials(name: string): string {
    if (!name) return 'GU';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
