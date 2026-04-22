// Polyfill for libraries expecting Node global in browser (sockjs-client, stompjs)
if (
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as any).global === 'undefined'
) {
  (globalThis as any).global = globalThis;
}
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: { NODE_ENV: 'development' } };
}
// Ensure identifier global exists in module scope for strict mode evaluation
declare global {
  interface Window {
    global?: any;
    process?: any;
  }
}

declare var global: any;
if (typeof global === 'undefined') {
  (window as any).global = window;
  (window as any).process = (window as any).process || {
    env: { NODE_ENV: 'development' }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).global = window;
  // assign to module-scoped variable for libraries that reference `global` directly
  (window as any).global = window;
}

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    ngZoneEventCoalescing: true
  })
  .catch(err => console.error(err));
