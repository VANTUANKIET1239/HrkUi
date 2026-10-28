import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../../environments/dev/environment';
import { HrkApiService } from './hrk-api.service';

describe('HrkApiService request bodies', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('returns raw bundle JSON without adding a body content type to GET', () => {
    const bundle = { group: 'game', culture: 'en-US', revision: 1, translations: { HELLO: 'Hello' } };
    let result: unknown;
    TestBed.inject(HrkApiService).CallApi('GET', 'language/bundles/game/en-US').subscribe(value => result = value);
    const request = http.expectOne(environment.baseUrl + 'language/bundles/game/en-US');
    expect(request.request.headers.has('Content-Type')).toBeFalse();
    request.flush(bundle);
    expect(result).toEqual(bundle);
  });

  it('retains JSON headers for JSON bodies and lets the browser set multipart boundaries', () => {
    const api = TestBed.inject(HrkApiService);
    api.CallApi('POST', 'test/json', { value: 1 }).subscribe();
    const json = http.expectOne(environment.baseUrl + 'test/json');
    expect(json.request.headers.get('Content-Type')).toBe('application/json');
    expect(json.request.body).toEqual({ value: 1 });
    json.flush({});
    const body = new FormData();
    body.set('value', '1');
    api.CallApi('POST', 'test/upload', body).subscribe();
    const upload = http.expectOne(environment.baseUrl + 'test/upload');
    expect(upload.request.headers.has('Content-Type')).toBeFalse();
    expect(upload.request.body).toBe(body);
    upload.flush({});
  });
});
