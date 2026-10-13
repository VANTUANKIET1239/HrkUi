import { InjectionToken } from '@angular/core';

export interface HrkModalConfig {
  code: string;
  kind: 'CONFIRMATION' | 'CONTENT' | 'NOTICE';
  title: string;
  messageTemplate: string;
  confirmText: string;
  cancelText: string;
  iconKey: string;
  size: 'SM' | 'MD' | 'LG' | 'FULLSCREEN';
  tone: 'DEFAULT' | 'WARNING' | 'DANGER' | 'SUCCESS';
  closeOnBackdrop: boolean;
  closeOnEscape: boolean;
  revision: number;
}

export interface HrkModalConfigSource {
  resolve(code: string, fallback: Partial<HrkModalConfig>, parameters?: Record<string, string | number>): HrkModalConfig;
  load?(): void;
}

export const HRK_MODAL_CONFIG_SOURCE = new InjectionToken<HrkModalConfigSource>('HRK_MODAL_CONFIG_SOURCE', {
  providedIn: 'root', factory: () => ({ resolve: (code, fallback) => modalDefaults(code, fallback) })
});

export function modalDefaults(code: string, overrides: Partial<HrkModalConfig> = {}): HrkModalConfig {
  return { code, kind: 'CONTENT', title: 'Thông tin', messageTemplate: '', confirmText: 'Xác nhận',
    cancelText: 'Hủy', iconKey: 'info', size: 'MD', tone: 'DEFAULT', closeOnBackdrop: true,
    closeOnEscape: true, revision: 1, ...overrides };
}

export const MODAL_ICONS: Record<string, string> = {
  info: 'bi-info-circle-fill', warning: 'bi-exclamation-triangle-fill', logout: 'bi-box-arrow-right',
  skip: 'bi-skip-forward-fill', tower: 'bi-building', reward: 'bi-gift-fill', hero: 'bi-shield-shaded'
};
