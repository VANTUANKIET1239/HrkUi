import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { throwError } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';
import { TokenManagerService } from '../../../auth/services/token-manager';
import { SessionExpiredService } from '../../../auth/services/session-expired.service';
import { AppError } from '../app-error';

describe('AuthInterceptor error handling', () => {
  let tokens: jasmine.SpyObj<TokenManagerService>;
  let session: jasmine.SpyObj<SessionExpiredService>;
  let interceptor: AuthInterceptor;
  const request = new HttpRequest('GET', '/gateway/dcs-game/player');
  const unauthorized = new HttpErrorResponse({ status: 401 });

  beforeEach(() => {
    tokens = jasmine.createSpyObj('tokens', ['getAccessToken', 'forceRefresh', 'hasSessionHint', 'forceDeleteAllCache']);
    session = jasmine.createSpyObj('session', ['open']);
    tokens.getAccessToken.and.returnValue(Promise.resolve('old-token'));
    tokens.hasSessionHint.and.returnValue(true);
    interceptor = new AuthInterceptor(tokens, session);
  });

  it('does not expire a session when the retried business request returns 409', fakeAsync(() => {
    tokens.forceRefresh.and.returnValue(Promise.resolve('new-token'));
    let calls = 0;
    const conflict = new HttpErrorResponse({ status: 409 });
    const handler: HttpHandler = { handle: () => throwError(() => ++calls === 1 ? unauthorized : conflict) };
    const error = jasmine.createSpy('error');
    interceptor.intercept(request, handler).subscribe({ error });
    flushMicrotasks();
    expect(error).toHaveBeenCalledWith(conflict);
    expect(tokens.forceDeleteAllCache).not.toHaveBeenCalled();
    expect(session.open).not.toHaveBeenCalled();
  }));

  for (const status of [0, 401, 500]) {
    it(`propagates refresh failure ${status} to every waiting request`, fakeAsync(() => {
      let reject!: (reason: unknown) => void;
      tokens.forceRefresh.and.returnValue(new Promise<string>((_, failRefresh) => reject = failRefresh));
      const handler: HttpHandler = { handle: () => throwError(() => unauthorized) };
      const first = jasmine.createSpy('first error');
      const second = jasmine.createSpy('second error');
      interceptor.intercept(request, handler).subscribe({ error: first });
      interceptor.intercept(request, handler).subscribe({ error: second });
      flushMicrotasks();
      expect(tokens.forceRefresh).toHaveBeenCalledTimes(1);
      const failure = new AppError(status, 'REFRESH_FAILED', 'Refresh failed.', status === 401 ? 'auth' : status === 0 ? 'network' : 'system');
      reject(failure);
      flushMicrotasks();
      expect(first).toHaveBeenCalledWith(failure);
      expect(second).toHaveBeenCalledWith(failure);
      expect(session.open).toHaveBeenCalledTimes(status === 401 ? 1 : 0);
    }));
  }

  it('preserves the session if pre-request token refresh fails due to network', fakeAsync(() => {
    const failure = new AppError(0, 'NETWORK_ERROR', 'Offline', 'network');
    tokens.getAccessToken.and.returnValue(Promise.reject(failure));
    const error = jasmine.createSpy('error');
    interceptor.intercept(request, { handle: () => { throw new Error('Request must not be sent'); } }).subscribe({ error });
    flushMicrotasks();
    expect(error).toHaveBeenCalledWith(failure);
    expect(session.open).not.toHaveBeenCalled();
  }));
});
