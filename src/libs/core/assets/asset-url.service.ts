import { DOCUMENT } from '@angular/common';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { environment } from '../../../../environments/dev/environment';
import catalog from '../../../assets/catalog/asset-paths.json';

export type ImageKind = 'hero' | 'item' | 'background' | 'effect';
export interface AssetUrlOptions {
  baseUrl: string;
  allowedOrigins: readonly string[];
}
export const HRK_ASSET_OPTIONS = new InjectionToken<AssetUrlOptions>('HRK_ASSET_OPTIONS', {
  providedIn: 'root',
  factory: () => ({ baseUrl: environment.assetBaseUrl, allowedOrigins: environment.allowedImageOrigins }),
});

@Injectable({ providedIn: 'root' })
export class AssetUrlService {
  private readonly document = inject(DOCUMENT);
  private readonly options = inject(HRK_ASSET_OPTIONS);
  private readonly aliases: Readonly<Record<string, string>> = catalog.aliases;

  resolve(value: string | null | undefined): string {
    const source = value?.trim() ?? '';
    if (!source || /[\u0000-\u001f'"<>\\]/.test(source)) return '';
    if (/^blob:/i.test(source)) return source;
    if (/^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(source)) return source;
    if (/^(https?:)?\/\//i.test(source)) {
      try {
        const url = new URL(source, this.document.baseURI);
        const origins = [this.document.baseURI, environment.baseUrl, this.options.baseUrl, ...this.options.allowedOrigins]
          .map(origin => new URL(origin, this.document.baseURI).origin);
        return ['http:', 'https:'].includes(url.protocol) && origins.includes(url.origin) ? url.href : '';
      } catch { return ''; }
    }
    // Arbitrary schemes and API paths are not asset keys. Custom avatars use their full API URL.
    if (/^[a-z][a-z\d+.-]*:/i.test(source)) return '';
    const suffixIndex = source.search(/[?#]/);
    const suffix = suffixIndex < 0 ? '' : source.slice(suffixIndex);
    let key = (suffixIndex < 0 ? source : source.slice(0, suffixIndex)).replace(/^\/?assets\//, '').replace(/^\//, '');
    try {
      if (decodeURIComponent(key).split('/').some(part => part === '.' || part === '..' || part.includes('\\'))) return '';
    } catch { return ''; }
    // Compatibility with the original equipment directory before its earlier consolidation.
    if (key.startsWith('equipments/')) key = 'images/dcs-game/' + key;
    key = this.aliases[key] ?? key;
    if (!/^(images|svgs|icons|loading)\//.test(key)) return '';
    return this.options.baseUrl.replace(/\/$/, '') + '/' + key + suffix;
  }

  placeholder(kind: ImageKind): string {
    return kind === 'effect' ? '' : this.resolve(catalog.placeholders[kind]);
  }

  /** A complete, quoted CSS value for dynamic map/background artwork. */
  background(value: string | null | undefined): string {
    const url = this.resolve(value) || this.placeholder('background');
    return `url("${url.replace(/["\r\n]/g, character => encodeURIComponent(character))}")`;
  }
}
