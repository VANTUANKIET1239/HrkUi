import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';
import { LOADING_MODE } from './loading.tokens';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const loadingMode = req.context.get(LOADING_MODE);

    if (loadingMode !== 'global') {
      return next.handle(req);
    }

    this.loadingService.show();

    return next.handle(req).pipe(
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }
}
