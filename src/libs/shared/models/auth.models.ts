export interface CacheEntry {
  token: string;
  exp: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  accessTokenExpiresAt?: number;
}


export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
  statusCode: number;
  hasErrors?: boolean;
}
