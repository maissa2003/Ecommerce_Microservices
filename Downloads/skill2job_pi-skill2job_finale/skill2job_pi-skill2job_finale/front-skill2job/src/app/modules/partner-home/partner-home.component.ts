import { Component, OnInit } from '@angular/core';
import { AuthService, JwtResponse } from '../../modules/services/auth.service';

@Component({
  selector: 'app-partner-home',
  templateUrl: './partner-home.component.html',
  styleUrls: ['./partner-home.component.css']
})
export class PartnerHomeComponent implements OnInit {
  currentUser: JwtResponse | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
}
