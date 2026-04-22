import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  private textKey = 'certificate_signature';
  private imageKey = 'certificate_signature_image';

  getSignature(): string {
    return localStorage.getItem(this.textKey) || 'SKILL2JOB';
  }

  setSignature(signature: string): void {
    localStorage.setItem(this.textKey, signature || 'SKILL2JOB');
  }

  getSignatureImage(): string | null {
    return localStorage.getItem(this.imageKey);
  }

  setSignatureImage(dataUrl: string): void {
    if (dataUrl) {
      localStorage.setItem(this.imageKey, dataUrl);
    } else {
      localStorage.removeItem(this.imageKey);
    }
  }
}
