import { HttpErrorResponse } from '@angular/common/http';
import { AppError, reportAppError, reportAppWarning, toAppError } from './app-error';

describe('AppError', () => {
  it('preserves validation details and supports existing error.message readers', () => {
    const error = toAppError(new HttpErrorResponse({ status: 400, error: { traceId: 'trace',
      error: { code: 'VALIDATION_ERROR', type: 'validation', message: 'Invalid name.', validationErrors: { Name: ['Required.'] } } } }));
    expect(error.validationErrors).toEqual({ Name: ['Required.'] });
    expect(error.error.message).toBe('Invalid name.');
    expect(toAppError(error)).toBe(error);
  });

  it('does not log business, validation or authentication errors', () => {
    const logError = spyOn(console, 'error');
    const logWarning = spyOn(console, 'warn');
    for (const type of ['business', 'validation', 'auth'] as const) {
      const error = new AppError(409, 'EXPECTED', 'Rejected.', type);
      reportAppError('Request failed', error);
      reportAppWarning('Request failed', error);
    }
    expect(logError).not.toHaveBeenCalled();
    expect(logWarning).not.toHaveBeenCalled();
  });

  it('logs system errors with their trace ID and does not trust a business label on HTTP 500', () => {
    const log = spyOn(console, 'error');
    const error = toAppError(new HttpErrorResponse({ status: 500, error: { traceId: 'trace-500',
      error: { code: 'INTERNAL_SERVER_ERROR', type: 'business', message: 'System failure.' } } }));
    expect(error.expected).toBeFalse();
    reportAppError('Request failed', error);
    expect(log).toHaveBeenCalledWith('Request failed', jasmine.objectContaining({ traceId: 'trace-500', status: 500 }));
  });

  it('supports validation ProblemDetails and legacy errors arrays', () => {
    const validation = toAppError(new HttpErrorResponse({ status: 400, error: { title: 'Invalid request', errors: { Name: ['Required'] } } }));
    expect(validation.validationErrors).toEqual({ Name: ['Required'] });
    const legacy = toAppError(new HttpErrorResponse({ status: 409, error: { message: 'Failed', errors: ['Item locked.'] } }));
    expect(legacy.message).toBe('Item locked.');
  });

  it('reports a system failure once even when both API service and component report it', () => {
    const log = spyOn(console, 'error');
    const error = new AppError(500, 'INTERNAL_SERVER_ERROR', 'System failure.', 'system', 'trace');
    reportAppError('API failure', error);
    reportAppError('Component failure', error);
    expect(log).toHaveBeenCalledTimes(1);
  });
});
