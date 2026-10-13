import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppError } from './app-error';
import { HrkApiService } from './hrk-api.service';

describe('HrkApi', () => {
  let service: HrkApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(HrkApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('routes business failure to error with code/message/trace, never next', () => {
    const next = jasmine.createSpy('next');
    const error = jasmine.createSpy('error');
    service.CallApi('POST', 'https://test/upgrade', {}).subscribe({ next, error });
    http.expectOne('https://test/upgrade').flush({ success: false, statusCode: 409, traceId: 'trace-1',
      data: null, error: { code: 'INSUFFICIENT_GOLD', message: 'Không đủ Vàng.', type: 'business' } },
      { status: 409, statusText: 'Conflict' });
    expect(next).not.toHaveBeenCalled();
    const failure = error.calls.mostRecent().args[0] as AppError;
    expect(failure instanceof AppError).toBeTrue();
    expect(failure.code).toBe('INSUFFICIENT_GOLD');
    expect(failure.message).toBe('Không đủ Vàng.');
    expect(failure.traceId).toBe('trace-1');
    expect(failure.expected).toBeTrue();
  });

  it('keeps a failed gameplay outcome in a successful request on next', () => {
    const next = jasmine.createSpy('next');
    const error = jasmine.createSpy('error');
    service.CallApi('GET', 'https://test/battle').subscribe({ next, error });
    const body = { success: true, statusCode: 200, data: { success: false, outcome: 'defeat' }, error: null };
    http.expectOne('https://test/battle').flush(body);
    expect(next).toHaveBeenCalledWith(body);
    expect(error).not.toHaveBeenCalled();
  });

  it('also rejects legacy failure envelopes delivered with HTTP 200', () => {
    const error = jasmine.createSpy('error');
    service.CallApi('GET', 'https://test/legacy').subscribe({ next: () => fail('Unexpected success'), error });
    http.expectOne('https://test/legacy').flush({ success: false, statusCode: 404, message: 'Hero missing.' });
    expect(error.calls.mostRecent().args[0].status).toBe(404);
    expect(error.calls.mostRecent().args[0].message).toBe('Hero missing.');
  });

  it('normalizes network failures without emitting a successful response', () => {
    const log = spyOn(console, 'error');
    const error = jasmine.createSpy('error');
    service.CallApi('GET', 'https://test/offline').subscribe({ next: () => fail('Unexpected success'), error });
    http.expectOne('https://test/offline').error(new ProgressEvent('error'));
    expect(error.calls.mostRecent().args[0].type).toBe('network');
    expect(error.calls.mostRecent().args[0].code).toBe('NETWORK_ERROR');
    expect(log).toHaveBeenCalledTimes(1);
  });
});
