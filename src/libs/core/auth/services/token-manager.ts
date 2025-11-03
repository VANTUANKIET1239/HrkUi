import { HrkApiService } from '../../http/hrk-api/hrk-api.service';
// tokenManager.ts


import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';


type CacheEntry = { token: string; exp: number };

@Injectable({
  providedIn: 'root'
})
export class TokenManagerService {

  constructor(private http: HttpClient) {}


  private cache = new Map<string, CacheEntry>();            // audience -> token
  private inflight = new Map<string, Promise<string>>();    // audience -> ongoing refresh
  private SKEW_SEC = 60;

  private parseExp(jwt: string) {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return payload.exp as number; // seconds since epoch
  }
  private isExpiringSoon(jwt?: string) {
    if (!jwt) return true;
    const now = Math.floor(Date.now() / 1000);
    return this.parseExp(jwt) - now <= this.SKEW_SEC;
  }

 private  async requestNewAT(audience: string): Promise<string> {
      const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // Optional: add CSRF protection if you use double-submit cookies
      // 'X-CSRF-Token': this.readCookie('csrf') ?? ''
    });

    const res = await firstValueFrom(
      this.http.post<{ accessToken: string; expiresIn?: number }>(
        '/auth/refresh',
        { audience },
        { withCredentials: true, headers }
      )
    );

    const accessToken = res.accessToken;
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

}
