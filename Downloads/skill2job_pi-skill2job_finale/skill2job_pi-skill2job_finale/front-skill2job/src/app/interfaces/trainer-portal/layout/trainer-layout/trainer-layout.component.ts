import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../../../modules/services/auth.service';
@Component({
  selector: 'app-trainer-layout',
  templateUrl: './trainer-layout.component.html',
  styleUrls: ['./trainer-layout.component.scss']
})
export class TrainerLayoutComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  private pollInterval: any = null;

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkUnread();
    this.pollInterval = setInterval(() => this.checkUnread(), 15000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  checkUnread(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.messageService.countUnread(userId).subscribe({
      next: (res: any) => {
        this.unreadCount = res.count;
      },
      error: () => {}
    });
  }
}
