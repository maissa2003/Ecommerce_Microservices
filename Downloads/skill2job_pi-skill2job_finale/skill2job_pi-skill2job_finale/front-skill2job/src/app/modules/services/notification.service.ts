import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  success(message: string): void {
    console.log(message);
  }

  info(message: string): void {
    console.log(message);
  }

  error(message: string): void {
    console.error(message);
    alert(message);
  }
}
