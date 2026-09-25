import { HrkApiService } from '../../http/hrk-api/hrk-api.service';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiEndpoints } from '../../../../app/shell/src/app/core/api-enpoints/api-endpoints';
import { ApiMethod } from '../../../shared/common/constants/ApiMethod.constants';
import { BaseResponse, CacheEntry, RefreshTokenResponse } from '../../../shared/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class TokenManagerService {
  constructor(private hrkApiService: HrkApiService) {}

  public readonly authApi = ApiEndpoints.Auth;
  private readonly SESSION_HINT_KEY = 'hrk_has_session';
  private cache = new Map<string, CacheEntry>();            // audience -> token (In-Memory only, XSS safe)
  private inflight = new Map<string, Promise<string>>();    // audience -> ongoing refresh
  private refreshQueue: Promise<void> = Promise.resolve(); // serialize refresh-token rotation across audiences
  private SKEW_SEC = 60;

  /** Session marker to prevent unnecessary 400/401 refresh-token calls when unauthenticated */
  hasSessionHint(): boolean {
    return localStorage.getItem(this.SESSION_HINT_KEY) === 'true';
  }

  setSessionHint(): void {
    localStorage.setItem(this.SESSION_HINT_KEY, 'true');
  }

  clearSessionHint(): void {
    localStorage.removeItem(this.SESSION_HINT_KEY);
  }

  private parseExp(jwt: string): number {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      return (payload.exp as number) || 0;
    } catch {
      return 0;
    }
  }

  private isExpiringSoon(jwt?: string): boolean {
    if (!jwt) return true;
    const now = Math.floor(Date.now() / 1000);
    return this.parseExp(jwt) - now <= this.SKEW_SEC;
  }

  private async requestNewAT(audience: string): Promise<string> {
    const res = await firstValueFrom(
      this.hrkApiService.CallApi<BaseResponse<RefreshTokenResponse>>(
        ApiMethod.POST,
        this.authApi.Refresh,
        { audience },
        { withCredentials: true }
      )
    );

    if (!res.success || !res.data?.accessToken) {
      throw new Error(res.message || 'Refresh token is invalid or expired.');
    }

    const accessToken = res.data.accessToken;
    this.cache.set(audience, { token: accessToken, exp: this.parseExp(accessToken) });
    this.setSessionHint();
    return accessToken;
  }

  /** Single-flight: only one refresh per audience; others await the same promise. */
  private async refreshOnce(audience: string): Promise<string> {
    let p = this.inflight.get(audience);
    if (!p) {
      const previous = this.refreshQueue.catch(() => undefined);
      p = previous
        .then(() => this.requestNewAT(audience))
        .finally(() => this.inflight.delete(audience));
      this.refreshQueue = p.then(() => undefined, () => undefined);
      this.inflight.set(audience, p);
    }
    return p;
  }

  /** Public API: always call this before hitting a service. */
  async getAccessToken(audience: string): Promise<string> {
    const entry = this.cache.get(audience);
    if (entry && !this.isExpiringSoon(entry.token)) return entry.token;
    return this.refreshOnce(audience);
  }

  /** On 401 retry path, force a refresh but still single-flight guarded. */
  async forceRefresh(audience: string): Promise<string> {
    this.cache.delete(audience);
    return this.refreshOnce(audience);
  }

  /** Clear all in-memory token cache and cleanup session hints */
  forceDeleteAllCache(): void {
    this.cache.clear();
    this.inflight.clear();
    this.refreshQueue = Promise.resolve();
    this.clearSessionHint();
    // Clean up any legacy localStorage tokens if present from older versions
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('at_')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /** Set access token for a specific audience (Stored in RAM memory only - XSS safe) */
  setAccessToken(audience: string, token: string): void {
    const exp = this.parseExp(token);
    this.cache.set(audience, { token, exp });
    this.setSessionHint();
  }

  /** Synchronous check: Returns true if valid access token exists in memory cache */
  hasValidTokenInCache(audience: string = 'auth-api'): boolean {
    const entry = this.cache.get(audience);
    return !!(entry && entry.token && !this.isExpiringSoon(entry.token));
  }

  /**
   * Asynchronous session check:
   * Checks memory cache. If not found or expired, calls getAccessToken(audience)
   * only if the user has an active session hint.
   * Returns true if user has a valid active session.
   */
  async checkAuthSession(audience: string = 'auth-api'): Promise<boolean> {
    if (this.hasValidTokenInCache(audience)) {
      return true;
    }

    // Never make a network call to refresh-token if the user has no session marker!
    if (!this.hasSessionHint()) {
      return false;
    }

    try {
      const token = await this.getAccessToken(audience);
      return !!(token && !this.isExpiringSoon(token));
    } catch {
      this.clearSessionHint();
      return false;
    }
  }

  /** Check if valid token exists in memory for a specific audience */
  isLoggedIn(audience: string = 'auth-api'): boolean {
    const entry = this.cache.get(audience);
    return !!(entry && entry.token && !this.isExpiringSoon(entry.token));
  }

  /** Clear token(s) from memory cache */
  clearTokens(audience?: string): void {
    if (audience) {
      this.cache.delete(audience);
      this.inflight.delete(audience);
    } else {
      this.forceDeleteAllCache();
    }
  }
}
