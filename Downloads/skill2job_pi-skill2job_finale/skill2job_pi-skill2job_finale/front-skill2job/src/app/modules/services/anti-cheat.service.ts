import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

export type ViolationType =
  | 'TAB_SWITCH'
  | 'COPY_PASTE'
  | 'FULLSCREEN_EXIT'
  | 'RIGHT_CLICK'
  | 'WINDOW_BLUR';

export interface ViolationEvent {
  type: ViolationType;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class AntiCheatService {
  private apiUrl = 'http://localhost:8090/api/exams/violations';
  private MAX_VIOLATIONS = 3;
  private violationCount = 0;
  private attemptId: number | null = null;
  private learnerId: number | null = null;

  // Emits violation events to the exam component
  violation$ = new Subject<ViolationEvent>();
  // Emits true when auto-submit should trigger
  autoSubmit$ = new Subject<void>();

  private listeners: {
    event: string;
    handler: EventListener;
    target: any;
  }[] = [];

  constructor(private http: HttpClient, private ngZone: NgZone) {}

  start(attemptId: number, learnerId: number) {
    this.attemptId = attemptId;
    this.learnerId = learnerId;
    this.violationCount = 0;
    this.registerListeners();
  }

  stop() {
    this.listeners.forEach(({ event, handler, target }) => {
      target.removeEventListener(event, handler);
    });
    this.listeners = [];
  }

  private registerListeners() {
    this.addListener(document, 'visibilitychange', () => {
      if (document.hidden) this.handle('TAB_SWITCH');
    });

    this.addListener(window, 'blur', () => {
      this.handle('WINDOW_BLUR');
    });

    this.addListener(document, 'copy', (e: Event) => {
      e.preventDefault();
      this.handle('COPY_PASTE');
    });

    this.addListener(document, 'paste', (e: Event) => {
      e.preventDefault();
      this.handle('COPY_PASTE');
    });

    this.addListener(document, 'contextmenu', (e: Event) => {
      e.preventDefault();
      this.handle('RIGHT_CLICK');
    });

    this.addListener(document, 'fullscreenchange', () => {
      if (!document.fullscreenElement) this.handle('FULLSCREEN_EXIT');
    });
  }

  private addListener(target: any, event: string, handler: EventListener) {
    target.addEventListener(event, handler);
    this.listeners.push({ event, handler, target });
  }

  private handle(type: ViolationType) {
    this.violationCount++;
    this.logToBackend(type);

    this.ngZone.run(() => {
      this.violation$.next({ type, count: this.violationCount });

      if (this.violationCount >= this.MAX_VIOLATIONS) {
        this.autoSubmit$.next();
      }
    });
  }

  private logToBackend(type: ViolationType) {
    if (!this.attemptId) return;
    this.http
      .post(this.apiUrl, {
        examAttemptId: this.attemptId,
        learnerId: this.learnerId,
        type
      })
      .subscribe();
  }

  requestFullscreen(element?: HTMLElement): void {
    const target = element ?? document.documentElement;
    target.requestFullscreen().catch(() => {});
  }
}
