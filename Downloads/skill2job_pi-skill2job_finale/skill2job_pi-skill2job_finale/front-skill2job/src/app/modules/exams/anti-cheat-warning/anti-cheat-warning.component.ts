import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-anti-cheat-warning',
  templateUrl: './anti-cheat-warning.component.html',
  styleUrls: ['./anti-cheat-warning.component.scss']
})
export class AntiCheatWarningComponent {
  @Input() visible = false;
  @Input() count = 0;
  @Input() max = 3;
  @Input() violationType = '';
  @Output() dismissed = new EventEmitter<void>();

  get violationMessage(): string {
    const messages: Record<string, string> = {
      TAB_SWITCH: 'You switched tabs or minimized the window.',
      WINDOW_BLUR: 'You left the exam window.',
      COPY_PASTE: 'Copy/paste is not allowed during the exam.',
      RIGHT_CLICK: 'Right-click is disabled during the exam.',
      FULLSCREEN_EXIT: 'You exited fullscreen mode.'
    };
    return messages[this.violationType] || 'Suspicious activity detected.';
  }

  dismiss() {
    this.dismissed.emit();
  }
}
