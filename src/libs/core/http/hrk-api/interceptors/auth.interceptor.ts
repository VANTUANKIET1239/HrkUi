import { TokenManagerService } from './../../../auth/services/token-manager';
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
import { NavigationService } from '../../../services/navigation.service';
import { ApiEndpoints } from '../../../../../app/shell/src/app/core/api-enpoints/api-endpoints';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private audienceMap = [
    { prefix: '/gateway/payroll', audience: 'payroll-api' },
    { prefix: '/gateway/cab', audience: 'cab-api' },
    { prefix: '/gateway/calc', audience: 'calcwork-api' },
    { prefix: '/gateway/auth', audience: 'auth-api' },
  ];



  public readonly authApi = ApiEndpoints.Auth;
  // private isRefreshing = false;
  // // holds the latest access token (or null while refreshing)
  // private refreshTokenSubject: BehaviorSubject<string | null> =
  //   new BehaviorSubject<string | null>(null);

  private uncheckAuthApiUrls = [
    this.authApi.Login,
    this.authApi.Register,
    this.authApi.Refresh
  ];

  constructor(
    private tokens: TokenManagerService,
    private navigationService: NavigationService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const found = this.audienceMap.find((m) => req.url.includes(m.prefix));
    const audience = found?.audience;

    if (!audience || this.onCheckRefreshTokenUrl(req)) return next.handle(req); // public endpoints like /auth/login/refresh

    return from(this.tokens.getAccessToken(audience)).pipe(
      switchMap((at) => {
        const withAuth = req.clone({
          setHeaders: { Authorization: `Bearer ${at}` },
          withCredentials: true
        });
        return next.handle(withAuth).pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
              return this.handle401Error(audience, req, next);
            }
            return throwError(() => err);
          })
        );
      })
    );
  }

  private onCheckRefreshTokenUrl(req: HttpRequest<any>): boolean {
      let result  = this.uncheckAuthApiUrls.some(url => req.url.includes(url));
      return result;
  }

  private handle401Error(
    audience: string,
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // if (!this.isRefreshing) {
    //   this.isRefreshing = true;
    //   this.refreshTokenSubject.next(null);
      return from(this.tokens.forceRefresh(audience)).pipe(
        switchMap((token) => {
          // const newAccess = token;

          // this.refreshTokenSubject.next(newAccess);

          // return next.handle(
          //   req.clone({ setHeaders: { Authorization: `Bearer ${newAccess}` } })
          // );

            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${token}` },
               withCredentials: true
            });
            return next.handle(retryReq);
        }),
        catchError((err) => {
          // refresh failed -> logout / redirect
          // this.auth.clearTokens();
          //  this.router.navigate(['/login'], { queryParams: { sessionExpired: true } });
          this.navigationService.goTo('/login');
          return throwError(() => err);
        }),
        // finalize(() => {
        //   this.isRefreshing = false;
        // })
      );

    // } else {
    //   return this.refreshTokenSubject.pipe(
    //     filter((token) => token != null), // wait for non-null token
    //     take(1),
    //     switchMap((token) => {
    //       // retry original request with the new token
    //       return next.handle(
    //         req.clone({
    //           setHeaders: { Authorization: `Bearer ${token as string}` },
    //         })
    //       );
    //     })
    //   );
    // }
  }
}
