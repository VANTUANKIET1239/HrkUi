import { HttpContext, HttpContextToken } from '@angular/common/http';

export type LoadingMode = 'global' | 'local' | 'none';

export const LOADING_MODE = new HttpContextToken<LoadingMode>(() => 'none');

/**
 * Creates or updates an HttpContext with the specified LoadingMode.
 * @param mode LoadingMode ('global' | 'local' | 'none')
 * @param existingContext Optional existing HttpContext to update
 */
export function withLoading(mode: LoadingMode = 'global', existingContext?: HttpContext): HttpContext {
  const context = existingContext ?? new HttpContext();
  return context.set(LOADING_MODE, mode);
}
