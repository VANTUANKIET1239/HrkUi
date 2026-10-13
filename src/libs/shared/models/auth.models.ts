export type { BaseResponse } from '../../core/http/hrk-api/api-response';
export interface CacheEntry {
  token: string;
  exp: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  accessTokenExpiresAt?: number;
}
