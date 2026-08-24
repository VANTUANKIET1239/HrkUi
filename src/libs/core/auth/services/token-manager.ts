import { HrkApiService } from '../../http/hrk-api/hrk-api.service';
// tokenManager.ts


import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { ApiEndpoints } from '../../../../app/shell/src/app/core/api-enpoints/api-endpoints';
import { ApiMethod } from '../../../shared/common/constants/ApiMethod.constants';
import { BaseResponse, CacheEntry, RefreshTokenResponse } from '../../../shared/models/auth.models';


// type CacheEntry = { token: string; exp: number };

@Injectable({
  providedIn: 'root'
})
export class TokenManagerService {

  constructor(private hrkApiService: HrkApiService) {}

  public readonly authApi = ApiEndpoints.Auth;
  private cache = new Map<string, CacheEntry>();            // audience -> token
  private inflight = new Map<string, Promise<string>>();    // audience -> ongoing refresh
  private SKEW_SEC = 60;

  private parseExp(jwt: string) {
      try{
        const payload = JSON.parse(atob(jwt.split(".")[1]));
        return payload.exp as number;
      } catch {
        return 0;
      }
  }
  private isExpiringSoon(jwt?: string) {
    if (!jwt) return true;
    const now = Math.floor(Date.now() / 1000);
    return this.parseExp(jwt) - now <= this.SKEW_SEC;
  }

 private async requestNewAT(audience: string): Promise<string> {
    //   const headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   // Optional: add CSRF protection if you use double-submit cookies
    //   // 'X-CSRF-Token': this.readCookie('csrf') ?? ''
    // });


    const res = await firstValueFrom(
      // this.http.post<{ accessToken: string; expiresIn?: number }>(
      //   'gateway/auth/refresh',
      //   { audience },
      //   { withCredentials: true, headers }
      // )

        this.hrkApiService.CallApi<BaseResponse<RefreshTokenResponse>>(ApiMethod.POST,this.authApi.Refresh,
              { audience: audience},
              {
                withCredentials: true
              })
    );

    const accessToken = res.data.accessToken;
    this.cache.set(audience, { token: accessToken, exp: this.parseExp(accessToken) });
    return accessToken;
  }

  /** Single-flight: only one refresh per audience; others await the same promise. */
  private async refreshOnce(audience: string): Promise<string> {
    let p = this.inflight.get(audience);
    if (!p) {
      p = this.requestNewAT(audience).finally(() => this.inflight.delete(audience));
      this.inflight.set(audience, p);
    }
    return p;
  }

  /** Public API: always call this before hitting a service. */
   async  getAccessToken(audience: string): Promise<string> {
    const entry = this.cache.get(audience);
    if (entry && !this.isExpiringSoon(entry.token)) return entry.token;
    return this.refreshOnce(audience);    // <-- second caller will await here, not collide
  }

  /** On 401 retry path, force a refresh but still single-flight guarded. */
   async  forceRefresh(audience: string) {
    this.cache.delete(audience);
    return this.refreshOnce(audience);
  }


    forceDeleteAllCache(){
      this.cache.clear();
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('at_')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }

  /** Set access token for a specific audience (e.g. 'auth-api', 'payroll-api') */
  setAccessToken(audience: string, token: string): void {
    const exp = this.parseExp(token);
    this.cache.set(audience, { token, exp });
    localStorage.setItem(`at_${audience}`, token);
  }

  /** Synchronous check: Returns true if valid access token exists in memory cache */
  hasValidTokenInCache(audience: string = 'auth-api'): boolean {
    const entry = this.cache.get(audience);
    return !!(entry && entry.token && !this.isExpiringSoon(entry.token));
  }

  /**
   * Asynchronous session check:
   * Checks memory cache. If not found or expired, calls getAccessToken(audience)
   * which uses the HTTP-only refresh cookie to retrieve a new AccessToken.
   * Returns true if user has a valid active session.
   */
  async checkAuthSession(audience: string = 'auth-api'): Promise<boolean> {
    if (this.hasValidTokenInCache(audience)) {
      return true;
    }
    try {
      const token = await this.getAccessToken(audience);
      return !!(token && !this.isExpiringSoon(token));
    } catch {
      return false;
    }
  }

  /** Check if valid token exists for a specific audience (defaults to 'auth-api') */
  isLoggedIn(audience: string = 'auth-api'): boolean {
    const entry = this.cache.get(audience);
    if (entry && entry.token && !this.isExpiringSoon(entry.token)) {
      return true;
    }
    const storedToken = localStorage.getItem(`at_${audience}`) || localStorage.getItem('access_token');
    if (storedToken && !this.isExpiringSoon(storedToken)) {
      this.cache.set(audience, { token: storedToken, exp: this.parseExp(storedToken) });
      return true;
    }
    return false;
  }

  /** Clear token(s) from cache and localStorage */
  clearTokens(audience?: string): void {
    if (audience) {
      this.cache.delete(audience);
      localStorage.removeItem(`at_${audience}`);
    } else {
      this.forceDeleteAllCache();
    }
  }

}
