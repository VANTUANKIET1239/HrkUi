import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenManagerService } from '../services/token-manager';

/**
 * authGuard: Protects routes from unauthenticated access.
 * If user is NOT logged in for auth-api, redirects to the login page (/dcs-game/auth).
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const tokenManager = inject(TokenManagerService);
  const router = inject(Router);

  const audience = route.data?.['audience'] || (state.url.includes('dcs-game') ? 'game-api' : 'auth-api');
  const isAuthenticated = await tokenManager.checkAuthSession(audience);

  if (isAuthenticated) {
    return true;
  }

  return router.createUrlTree(['/dcs-game/auth'], {
    queryParams: { returnUrl: state.url }
  });
};
