import { DOCUMENT } from '@angular/common';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/dev/environment';
import { preferredLanguage } from './language-preference';
import { BrowserCookieService } from '../storage/browser-cookie.service';
import { LOCALIZATION_CONFIG } from './localization.config';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  private readonly document = inject(DOCUMENT);
  private readonly cookies = inject(BrowserCookieService);
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const target = new URL(request.url, this.document.baseURI);
    const gateway = new URL(environment.baseUrl, this.document.baseURI);
    if (target.origin === gateway.origin && target.pathname.startsWith(gateway.pathname) && !request.headers.has('Accept-Language'))
      request = request.clone({ setHeaders: { 'Accept-Language': preferredLanguage(this.cookies.get(LOCALIZATION_CONFIG.cookie.name)) } });
    return next.handle(request);
  }
}
