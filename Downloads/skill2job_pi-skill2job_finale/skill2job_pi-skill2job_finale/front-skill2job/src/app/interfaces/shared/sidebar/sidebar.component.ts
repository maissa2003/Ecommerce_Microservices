import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isSessionsOpen = false;
  isExamsOpen = false;
  isHrOpen = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      if (this.router.url.includes('/sessions')) {
        this.isSessionsOpen = true;
      }
      if (this.router.url.includes('/admin/exams')) {
        this.isExamsOpen = true;
      }
      if (this.router.url.includes('/hr')) {
        this.isHrOpen = true;
      }
    });
  }

  toggleSessionsMenu() {
    this.isSessionsOpen = !this.isSessionsOpen;
  }
  toggleExamsMenu() {
    this.isExamsOpen = !this.isExamsOpen;
  }
  toggleHrMenu() {
    this.isHrOpen = !this.isHrOpen;
  }
}
