// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface Tokens {
  accessToken: string;
  refreshToken?: string; // if you store refresh on client (prefer httpOnly cookie)
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    const t = localStorage.getItem('access_token');
    if (t) this.accessToken$.next(t);
  }

  getAccessToken(): string | null {
    return this.accessToken$.getValue();
  }

  accessTokenObservable(): Observable<string | null> {
    return this.accessToken$.asObservable();
  }

  setTokens(tokens: Tokens) {
    if (tokens.accessToken) {
      this.accessToken$.next(tokens.accessToken);
      localStorage.setItem('access_token', tokens.accessToken);
    }
    if (tokens.refreshToken) {
      localStorage.setItem('refresh_token', tokens.refreshToken);
    }
  }

  clearTokens() {
    this.accessToken$.next(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  login(username: string, password: string): Observable<Tokens> {
    return this.http.post<Tokens>('/api/auth/login', { username, password }).pipe(
      tap(tokens => this.setTokens(tokens))
    );
  }

  /**
   * Refresh token call. Returns Observable that emits new Tokens.
   * If you use httpOnly cookie for refresh token, server reads cookie and you don't
   * need to pass refresh token in body.
   */
  refreshToken(): Observable<Tokens> {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<Tokens>('/api/auth/refresh', { refreshToken: refresh }).pipe(
      tap(tokens => this.setTokens(tokens)),
      catchError(err => {
        // Optionally clear tokens on refresh failure
        this.clearTokens();
        return throwError(() => err);
      })
    );
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.exp) {
        return Date.now() < payload.exp * 1000;
      }
      return true;
    } catch {
      return !!token;
    }
  }
}
