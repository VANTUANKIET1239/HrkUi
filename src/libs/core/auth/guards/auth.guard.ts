import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenManagerService } from '../services/token-manager';
import { getAppAuthConfig, getAppAuthConfigForRoute } from '../config/app-auth.config';

/**
 * authGuard: Protects routes from unauthenticated access.
 * Redirects unauthenticated users to the shared shell login page.
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const tokenManager = inject(TokenManagerService);
  const router = inject(Router);

  // If user has not logged in or has logged out, redirect immediately without unnecessary network calls
  const inferredConfig = getAppAuthConfigForRoute(state.url);
  const appConfig = getAppAuthConfig(route.data?.['appCode'] ?? inferredConfig.appCode);
  const loginTree = () => router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url, app: appConfig.appCode }
  });

  if (!tokenManager.hasSessionHint()) return loginTree();

  const audience = route.data?.['audience'] || appConfig.audience;
  const isAuthenticated = await tokenManager.checkAuthSession(audience);

  if (isAuthenticated) {
    return true;
  }

  return loginTree();
};
