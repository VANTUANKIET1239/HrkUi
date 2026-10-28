import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { reportAppError, toAppError } from './app-error';
import { environment as env } from '../../../../../environments/dev/environment';
import { LoadingMode, LOADING_MODE } from '../../loading/loading.tokens';

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
  withCredentials?: boolean;
  loading?: LoadingMode;
}

@Injectable({
  providedIn: 'root',
})
export class HrkApiService {
  private baseUrl = env.baseUrl;
  private defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) { }

  ResolveUrl(url: string): string {
    return url.startsWith('http') ? url : `${this.baseUrl}${url}`;
  }

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
    const fullUrl = this.ResolveUrl(url);
    const currentOptions: CallOptions =
      ((!this.isWithBodyMethod(method)
        ? optionsOrBody
        : options) as CallOptions) ?? {};
    const body = this.isWithBodyMethod(method) ? optionsOrBody : null;

    const baseHeaders = body == null || body instanceof FormData ? new HttpHeaders() : this.defaultHeaders;
    const mergedHeaders = this.mergeHeaders(
      baseHeaders,
      currentOptions.headers
    );
    const normalizedParams = this.normalizeParams(currentOptions.params);
    const responseType = (currentOptions.responseType ?? 'json') as 'json';

    let context = currentOptions.context;
    if (currentOptions.loading) {
      context = (context ?? new HttpContext()).set(LOADING_MODE, currentOptions.loading);
    }

    const res = this.http
      .request<T>(method, fullUrl, {
        body: body,
        headers: mergedHeaders,
        params: normalizedParams,
        context: context,
        responseType,
        withCredentials: currentOptions.withCredentials
      })
      .pipe(
        map(data => {
          // Support legacy endpoints during migration; gameplay data.success is untouched.
          const envelope = data as { success?: boolean; statusCode?: number } | null;
          if (envelope?.success === false && typeof envelope.statusCode === 'number')
            throw new HttpErrorResponse({ error: data, status: envelope.statusCode >= 400 ? envelope.statusCode : 400, url: fullUrl });
          return data;
        }),
        catchError(err => {
          const error = toAppError(err);
          reportAppError('API request failed', error);
          return throwError(() => error);
        })
      );

    return res;
  }

  private isWithBodyMethod(method: HttpMethod): method is WithBodyHttpMethod {
    return method === 'POST' || method === 'PUT' || method === 'PATCH';
  }

  // private mergeHeaders(base: HttpHeaders, extra?: HttpHeaders): HttpHeaders {
  //   if (!extra) return base;
  //   let h = base;
  //   for (const [k, v] of Object.entries(extra)) {
  //     if (v !== undefined && v !== null) {
  //       h = h.set(k, String(v));
  //     }
  //   }
  //   return h;
  // }

  private mergeHeaders(base: HttpHeaders, extra?: HttpHeaders | { [header: string]: string | string[] }): HttpHeaders {
    if (!extra) return base;
    let h = base;
    if (extra instanceof HttpHeaders) {
      for (const key of extra.keys()) {
        const values = extra.getAll(key);
        if (values) {
          h = h.set(key, values);
        }
      }
    } else {
      for (const [k, v] of Object.entries(extra)) {
        if (v !== undefined && v !== null) {
          h = h.set(k, Array.isArray(v) ? v : String(v));
        }
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

