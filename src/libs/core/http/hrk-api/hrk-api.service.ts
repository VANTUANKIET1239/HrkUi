import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment as env } from '../../../../../environments/dev/environment';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type WithBodyHttpMethod = 'POST' | 'PUT' | 'PATCH';

type WithoutBodyHttpMethod = 'GET' | 'DELETE';

export interface CallOptions {
  params?: HttpParams;
  headers?: HttpHeaders;
  // behaviors
  context?: HttpContext;
  retry?: { max: number; backoffMs?: number };
  timeoutMs?: number;
  cacheTtlMs?: number; // GET only
  dedupeKey?: string; // GET only
  responseType?: 'json' | 'blob' | 'text';
  // validation (optional)
  validate?: <T>(data: unknown) => T;
  withCredentials?: boolean
}

@Injectable({
  providedIn: 'root',
})
export class HrkApiService {
  private baseUrl = env.baseUrl;
  private defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) {}

  CallApi<T>(
    method: WithoutBodyHttpMethod,
    url: string,
    options?: CallOptions
  ): Observable<T>;
  CallApi<T>(
    method: WithBodyHttpMethod,
    url: string,
    body: any,
    options?: CallOptions
  ): Observable<T>;
  CallApi<T>(
    method: HttpMethod,
    url: string,
    optionsOrBody?: CallOptions | unknown,
    options?: CallOptions
  ): Observable<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    const currentOptions: CallOptions =
      ((this.isWithBodyMethod(method)
        ? optionsOrBody
        : options) as CallOptions) ?? {};
    const body = this.isWithBodyMethod(method) ? optionsOrBody : null;

    const mergedHeaders = this.mergeHeaders(
      this.defaultHeaders,
      currentOptions.headers
    );
    const normalizedParams = this.normalizeParams(currentOptions.params);
    const responseType = (currentOptions.responseType ?? 'json') as 'json';

    const res = this.http
      .request<T>(method, fullUrl, {
        body: body,
        headers: mergedHeaders,
        params: normalizedParams,
        context: currentOptions.context,
        responseType,
        withCredentials: currentOptions.withCredentials
      })
      .pipe(catchError((err) => throwError(() => this.toAppError(err))));

    return res;
  }

  private toAppError(err: unknown) {
    if (err instanceof HttpErrorResponse) {
      return {
        status: err.status,
        message: err.error?.message ?? err.message,
        url: err.url ?? '',
        details: err.error ?? null,
      };
    }
    return {
      status: -1,
      message: (err as any)?.message ?? 'Unknown error',
      url: '',
      details: err,
    };
  }

  private isWithBodyMethod(method: HttpMethod): method is WithBodyHttpMethod {
    return method === 'POST' || method === 'PUT' || method === 'PATCH';
  }

  private mergeHeaders(base: HttpHeaders, extra?: HttpHeaders): HttpHeaders {
    if (!extra) return base;
    let h = base;
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== null) {
        h = h.set(k, String(v));
      }
    }
    return h;
  }

  private normalizeParams(params?: HttpParams): HttpParams | undefined {
    if (!params) return undefined;
    if (params instanceof HttpParams) return params;

    let hp = new HttpParams();
    for (const [k, v] of Object.entries(params)) {
      if (Array.isArray(v)) {
        for (const item of v) hp = hp.append(k, String(item));
      } else {
        hp = hp.set(k, String(v));
      }
    }
    return hp;
  }
}
