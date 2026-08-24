import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenManagerService } from '../services/token-manager';

/**
 * noAuthGuard: Prevents logged-in users from visiting auth pages (Login/Register).
 * If user IS logged in for auth-api, redirects them back to /dcs-game/home.
 */
export const noAuthGuard: CanActivateFn = async (route, state) => {
  const tokenManager = inject(TokenManagerService);
  const router = inject(Router);

  const audience = route.data?.['audience'] || (state.url.includes('dcs-game') ? 'game-api' : 'auth-api');
  const isAuthenticated = await tokenManager.checkAuthSession(audience);

  if (isAuthenticated) {
    return router.createUrlTree(['/dcs-game/home']);
  }

  return true;
};
