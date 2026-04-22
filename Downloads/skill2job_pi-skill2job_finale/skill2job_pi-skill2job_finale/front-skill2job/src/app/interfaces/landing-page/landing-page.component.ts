import { Component } from '@angular/core';
import { Router } from '@angular/router'; // ✅ ajout

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  isMobileMenuOpen = false;
  selectedMember: { name: string; email: string } | null = null;

  constructor(private router: Router) {} // ✅ ajout

  showEmail(name: string, email: string) {
    this.selectedMember = { name, email };
  }

  closePopup() {
    this.selectedMember = null;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  handleSignup() {
    this.closeMobileMenu();
    this.router.navigate(['/signup']); // ✅ correction
  }

  handleLogin() {
    this.closeMobileMenu();
    this.router.navigate(['/signin']); // ✅ correction
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth'
    });
  }
}
