import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenManagerService } from '../services/token-manager';
import { getAppAuthConfig, getAppAuthConfigForRoute } from '../config/app-auth.config';

/**
 * noAuthGuard: Prevents logged-in users from visiting auth pages (Login/Register).
 * If user IS logged in for auth-api, redirects them back to /dcs-game/home.
 */
export const noAuthGuard: CanActivateFn = async (route, state) => {
  const tokenManager = inject(TokenManagerService);
  const router = inject(Router);

  // If user has not logged in or has logged out, allow access immediately without any network call
  if (!tokenManager.hasSessionHint()) {
    return true;
  }

  const returnUrl = route.queryParamMap.get('returnUrl') ?? '';
  const inferredConfig = getAppAuthConfigForRoute(returnUrl);
  const config = getAppAuthConfig(
    route.queryParamMap.get('app') ?? route.data?.['appCode'] ?? inferredConfig.appCode
  );
  const audience = route.data?.['audience'] || config.audience;
  const isAuthenticated = await tokenManager.checkAuthSession(audience);

  if (isAuthenticated) {
    return router.createUrlTree([config.defaultRoute]);
  }

  return true;
};
