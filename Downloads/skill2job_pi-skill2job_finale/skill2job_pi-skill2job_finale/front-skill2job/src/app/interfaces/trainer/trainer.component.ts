import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../modules/services/auth.service';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrl: './trainer.component.css'
})
export class TrainerComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }
}
