import { TokenManagerService } from './../../../auth/services/token-manager';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private audienceMap = [
    { prefix: '/gateway/payroll', audience: 'payroll-api' },
    { prefix: '/gateway/cab',     audience: 'cab-api' },
    { prefix: '/gateway/calc',    audience: 'calcwork-api' },
  ];

  constructor(private tokens: TokenManagerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const found = this.audienceMap.find(m => req.url.startsWith(m.prefix));
    const audience = found?.audience;

    if (!audience) return next.handle(req); // public endpoints like /auth/login/refresh

    return from(this.tokens.getAccessToken(audience)).pipe(
      switchMap(at => {
        const withAuth = req.clone({ setHeaders: { Authorization: `Bearer ${at}` } });
        return next.handle(withAuth).pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
              return from(this.tokens.forceRefresh(audience)).pipe(
                switchMap(fresh => next.handle(
                  req.clone({ setHeaders: { Authorization: `Bearer ${fresh}` } })
                ))
              );
            }
            return throwError(() => err);
          })
        );
      })
    );
  }
}
