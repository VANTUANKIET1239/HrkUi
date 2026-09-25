export interface AppAuthConfig {
  appCode: string;
  routePrefix: string;
  apiPrefix: string;
  audience: string;
  defaultRoute: string;
  loginTitle: string;
  themeClass?: string;
}

const DEFAULT_APP_AUTH_CONFIGS: AppAuthConfig[] = [
  {
    appCode: 'dcs-game',
    routePrefix: '/dcs-game',
    apiPrefix: '/gateway/dcs-game',
    audience: 'game-api',
    defaultRoute: '/dcs-game/home',
    loginTitle: 'Đăng nhập DCS Game',
    themeClass: 'game-theme'
  },
  {
    appCode: 'hrm',
    routePrefix: '/hrm',
    apiPrefix: '/gateway/hrm',
    audience: 'hrm-api',
    defaultRoute: '/hrm/home',
    loginTitle: 'Đăng nhập HRM',
    themeClass: 'hrm-theme'
  },
  {
    appCode: 'crm',
    routePrefix: '/crm',
    apiPrefix: '/gateway/crm',
    audience: 'crm-api',
    defaultRoute: '/crm/home',
    loginTitle: 'Đăng nhập CRM',
    themeClass: 'crm-theme'
  }
];

export const APP_AUTH_CONFIGS: AppAuthConfig[] = [...DEFAULT_APP_AUTH_CONFIGS];

export function replaceAppAuthConfigs(configs: AppAuthConfig[]): void {
  const validConfigs = configs.filter(x =>
    !!x.appCode && !!x.routePrefix && !!x.apiPrefix && !!x.audience && !!x.defaultRoute
  );
  if (!validConfigs.length) return;
  APP_AUTH_CONFIGS.splice(0, APP_AUTH_CONFIGS.length, ...validConfigs);
}

export function getAppAuthConfig(appCode?: string | null): AppAuthConfig {
  return APP_AUTH_CONFIGS.find(x => x.appCode === appCode) ?? APP_AUTH_CONFIGS[0];
}

export function getAppAuthConfigForRoute(url: string): AppAuthConfig {
  return APP_AUTH_CONFIGS.find(x => url.startsWith(x.routePrefix)) ?? APP_AUTH_CONFIGS[0];
}

export function getAppAuthConfigForApi(url: string): AppAuthConfig | undefined {
  return APP_AUTH_CONFIGS.find(x => url.includes(x.apiPrefix));
}

export function isSafeInternalReturnUrl(url?: string | null): url is string {
  return !!url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/login');
}
