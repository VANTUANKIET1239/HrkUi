import { HttpErrorResponse } from '@angular/common/http';

export type AppErrorType = 'business' | 'validation' | 'auth' | 'system' | 'network';
export interface ApiError {
  code: string;
  message: string;
  type: AppErrorType;
  validationErrors?: Record<string, string[]> | null;
}

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly type: AppErrorType,
    public readonly traceId?: string,
    public readonly validationErrors?: Record<string, string[]>,
    public readonly url: string = ''
  ) { super(message); this.name = 'AppError'; }

  get expected(): boolean { return ['business', 'validation', 'auth'].includes(this.type); }
  // Compatibility for components still reading HttpErrorResponse.error.message.
  get error(): ApiError { return { code: this.code, message: this.message, type: this.type, validationErrors: this.validationErrors }; }
}

function record(value: unknown): Record<string, any> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, any> : undefined;
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (!(error instanceof HttpErrorResponse))
    return new AppError(-1, 'UNEXPECTED_CLIENT_ERROR', 'Đã xảy ra lỗi ứng dụng.', 'system');
  if (error.status === 0)
    return new AppError(0, 'NETWORK_ERROR', 'Không thể kết nối đến máy chủ.', 'network', undefined, undefined, error.url ?? '');

  const body = record(error.error);
  const detail = record(body?.['error']);
  const status = error.status;
  const defaultCode = status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN'
    : status === 404 ? 'NOT_FOUND' : status === 409 ? 'BUSINESS_CONFLICT'
    : status === 400 ? 'VALIDATION_ERROR' : status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED';
  const defaultType: AppErrorType = status >= 500 ? 'system' : status === 401 || status === 403 ? 'auth'
    : status === 400 ? 'validation' : 'business';
  const wireType = detail?.['type'];
  const type: AppErrorType = status >= 500 ? 'system'
    : ['business', 'validation', 'auth'].includes(wireType) ? wireType : defaultType;
  const legacyErrors = body?.['errors'];
  const message = detail?.['message'] ?? body?.['detail'] ?? body?.['title']
    ?? (Array.isArray(legacyErrors) ? legacyErrors[0] : undefined) ?? body?.['message'];
  const validationErrors = record(detail?.['validationErrors'])
    ?? (type === 'validation' ? record(legacyErrors) : undefined);
  return new AppError(status, detail?.['code'] ?? body?.['code'] ?? defaultCode,
    typeof message === 'string' && message.trim() ? message : 'Yêu cầu không thể thực hiện.',
    type, body?.['traceId'], validationErrors, error.url ?? '');
}

const reportedErrors = new WeakSet<AppError>();
function report(level: 'error' | 'warn', args: unknown[]): void {
  const original = args.find(value => value instanceof AppError || value instanceof HttpErrorResponse);
  if (original) {
    const error = toAppError(original);
    if (error.expected) return;
    if (reportedErrors.has(error)) return;
    reportedErrors.add(error);
    console[level](args.find(value => typeof value === 'string') ?? 'API failure',
      { status: error.status, code: error.code, traceId: error.traceId, message: error.message });
    return;
  }
  console[level](...args);
}
export const reportAppError = (...args: unknown[]): void => report('error', args);
export const reportAppWarning = (...args: unknown[]): void => report('warn', args);
