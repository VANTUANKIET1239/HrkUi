import { ApiError } from './app-error';

// HrkApiService delivers failures as AppError; successful next() responses carry T.
export interface BaseResponse<T> {
  traceId?: string;
  success: boolean;
  statusCode: number;
  data: T;
  error?: ApiError | null;
  message: string;
  errors?: string[] | null;
  hasErrors?: boolean;
}
