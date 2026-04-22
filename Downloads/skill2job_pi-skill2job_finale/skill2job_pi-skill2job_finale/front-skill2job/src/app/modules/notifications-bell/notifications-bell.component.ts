import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  NotificationResponse,
  NotificationService
} from '../../modules/services/notification.service';

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications-bell.component.html',
  styleUrls: ['./notifications-bell.component.scss']
})
export class NotificationsBellComponent implements OnInit, OnDestroy {
  open = false;
  loading = false;

  unread = 0;
  list: NotificationResponse[] = [];

  private timer: any;

  constructor(private notif: NotificationService, private router: Router) {}

  ngOnInit(): void {
    this.refresh();
    // ✅ polling light (toutes 20s)
    this.timer = setInterval(() => this.refreshCount(), 20000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  toggle(): void {
    this.open = !this.open;
    if (this.open) this.refresh();
  }

  refreshCount(): void {
    this.notif.unreadCount().subscribe({
      next: r => (this.unread = r?.unread ?? 0),
      error: () => {}
    });
  }

  refresh(): void {
    this.loading = true;
    this.notif.myNotifications().subscribe({
      next: data => {
        this.list = data || [];
        this.unread = this.list.filter(n => !n.read).length;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  openNotif(n: NotificationResponse): void {
    if (!n.read) {
      this.notif.markRead(n.id).subscribe({
        next: () => {
          n.read = true; // ✅ update UI instantly
          this.unread = Math.max(0, this.unread - 1);
        },
        error: () => {}
      });
    }

    this.open = false;

    if (n.link) {
      this.router.navigateByUrl(n.link);
    }
  }

  readAll(): void {
    this.notif.markAllRead().subscribe({
      next: () => this.refresh(),
      error: () => {}
    });
  }

  // ✅ NEW: delete one (without opening)
  deleteOne(n: NotificationResponse, event: MouseEvent): void {
    event.stopPropagation();

    this.notif.deleteOne(n.id).subscribe({
      next: () => {
        // update UI
        const wasUnread = !n.read;
        this.list = this.list.filter(x => x.id !== n.id);
        if (wasUnread) this.unread = Math.max(0, this.unread - 1);
      },
      error: () => alert('Erreur suppression notification')
    });
  }

  // ✅ NEW: clear all
  clearAll(): void {
    if (!confirm('Supprimer toutes les notifications ?')) return;

    this.notif.clearAll().subscribe({
      next: () => {
        this.list = [];
        this.unread = 0;
      },
      error: () => alert('Erreur clear all')
    });
  }
}
