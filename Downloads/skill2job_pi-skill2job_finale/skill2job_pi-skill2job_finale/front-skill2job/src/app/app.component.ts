import { Component, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'skill2job';
  showLoader = true;
  private firstLoad = true;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    // STARTUP loader
    setTimeout(() => {
      this.showLoader = false;
      this.firstLoad = false;
      this.cdr.detectChanges();
    }, 1200);

    // NAVIGATION loader
    this.router.events.subscribe(event => {
      // Show loader when navigating (but NOT first load)
      if (!this.firstLoad && event instanceof NavigationStart) {
        this.showLoader = true;
        this.cdr.detectChanges();
      }

      // Hide loader when page ready
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          this.showLoader = false;
          this.cdr.detectChanges();
        }, 500);
      }
    });
  }
}
