import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { getAppAuthConfigForRoute, isSafeInternalReturnUrl } from '../config/app-auth.config';

@Injectable({
  providedIn: 'root'
})
export class SessionExpiredService {
  private readonly _isOpen = signal(false);
  private readonly _returnUrl = signal<string | null>(null);

  readonly isOpen = this._isOpen.asReadonly();
  readonly returnUrl = this._returnUrl.asReadonly();

  constructor(private router: Router) {}

  open(returnUrl?: string): void {
    if (this._isOpen()) return; // Chống mở trùng popup

    const url = returnUrl || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : null);
    this._returnUrl.set(url);
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
    this._returnUrl.set(null);
  }

  confirmLogin(): void {
    const url = this._returnUrl();
    this.close();
    const queryParams: Record<string, string> = { sessionExpired: 'true' };
    if (isSafeInternalReturnUrl(url)) {
      queryParams['returnUrl'] = url;
      queryParams['app'] = getAppAuthConfigForRoute(url).appCode;
    }
    this.router.navigate(['/login'], { queryParams });
  }
}
