import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../modules/services/auth.service';

@Component({
  selector: 'app-trainer-home',
  templateUrl: './trainer-home.component.html',
  styleUrls: ['../trainer.component.css']
})
export class TrainerHomeComponent implements OnInit {
  username = 'Trainer';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.username = user?.username || 'Trainer';
  }
}
