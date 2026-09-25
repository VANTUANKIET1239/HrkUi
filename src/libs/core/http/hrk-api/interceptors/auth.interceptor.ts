import { TokenManagerService } from './../../../auth/services/token-manager';
import { SessionExpiredService } from './../../../auth/services/session-expired.service';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  from,
  Observable,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { ApiEndpoints } from '../../../../../app/shell/src/app/core/api-enpoints/api-endpoints';
import { getAppAuthConfigForApi } from '../../../auth/config/app-auth.config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private legacyAudienceMap = [
    { prefix: '/gateway/payroll', audience: 'payroll-api' },
    { prefix: '/gateway/cab', audience: 'cab-api' },
    { prefix: '/gateway/calc', audience: 'calcwork-api' },
    { prefix: '/gateway/auth', audience: 'auth-api' },
  ];

  public readonly authApi = ApiEndpoints.Auth;
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  private uncheckAuthApiUrls = [
    this.authApi.Login,
    this.authApi.Register,
    this.authApi.Refresh,
    this.authApi.Applications
  ];

  constructor(
    private tokens: TokenManagerService,
    private sessionExpiredService: SessionExpiredService
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const appConfig = getAppAuthConfigForApi(req.url);
    const legacyConfig = this.legacyAudienceMap.find((m) => req.url.includes(m.prefix));
    const audience = appConfig?.audience ?? legacyConfig?.audience;

    if (!audience || this.onCheckRefreshTokenUrl(req)) return next.handle(req); // public endpoints like /auth/login/refresh

    return from(this.tokens.getAccessToken(audience)).pipe(
      catchError((err) => {
        // getAccessToken can fail before the protected request is sent when
        // the refresh cookie/token has already expired. This error therefore
        // never reaches the inner HTTP catchError below.
        this.expireSession();
        return throwError(() => err);
      }),
      switchMap((at) => {
        const withAuth = req.clone({
          setHeaders: { Authorization: `Bearer ${at}` },
          withCredentials: true
        });
        return next.handle(withAuth).pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
              return this.handle401Error(audience, req, next, err);
            }
            return throwError(() => err);
          })
        );
      })
    );
  }

  private onCheckRefreshTokenUrl(req: HttpRequest<any>): boolean {
    return this.uncheckAuthApiUrls.some(url => req.url.includes(url));
  }

  private handle401Error(
    audience: string,
    req: HttpRequest<any>,
    next: HttpHandler,
    originalErr: HttpErrorResponse
  ): Observable<HttpEvent<any>> {
    // If user never had a session or on public auth endpoints, do not open session expired dialog
    if (!this.tokens.hasSessionHint() || this.onCheckRefreshTokenUrl(req)) {
      return throwError(() => originalErr);
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return from(this.tokens.forceRefresh(audience)).pipe(
        switchMap((token) => {
          this.refreshTokenSubject.next(token);
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          return next.handle(retryReq);
        }),
        catchError((err) => {
          // Refresh token is expired or invalid -> clear session and open single session-expired modal
          this.expireSession();

          return throwError(() => err);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // Single-flight queue for concurrent 401 requests
      return this.refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((token) => {
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          return next.handle(retryReq);
        })
      );
    }
  }

  private expireSession(): void {
    this.tokens.forceDeleteAllCache();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('hrk-dungeon-current-run');
      sessionStorage.removeItem('hrk-dungeon-current-map');
    }
    const currentUrl = typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : undefined;
    this.sessionExpiredService.open(currentUrl);
  }
}
