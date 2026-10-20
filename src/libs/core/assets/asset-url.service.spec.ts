import { TestBed } from '@angular/core/testing';
import { AssetUrlService, HRK_ASSET_OPTIONS } from './asset-url.service';

describe('AssetUrlService', () => {
  function service(baseUrl = '/assets/', allowedOrigins: string[] = []): AssetUrlService {
    TestBed.configureTestingModule({ providers: [{ provide: HRK_ASSET_OPTIONS, useValue: { baseUrl, allowedOrigins } }] });
    return TestBed.inject(AssetUrlService);
  }

  for (const value of ['images/dcs-game/kiet.png', '/assets/images/dcs-game/kiet.png', 'assets/images/dcs-game/kiet.png']) {
    it(`resolves legacy portraits without a duplicated prefix: ${value}`, () => {
      expect(service().resolve(value)).toBe('/assets/images/dcs-game/heroes/kiet.png');
    });
  }

  it('applies a CDN base to keys and legacy paths, preserving query and fragment', () => {
    expect(service('https://cdn.example.com/game-assets/').resolve('/assets/images/dcs-game/HoangNguyen-Gymer.png?v=2#portrait'))
      .toBe('https://cdn.example.com/game-assets/images/dcs-game/heroes/hoang-nguyen-gymer.png?v=2#portrait');
  });

  it('supports a deployment below a path prefix', () => {
    expect(service('/hrk/assets/').resolve('images/dcs-game/summon/normal-chest.png'))
      .toBe('/hrk/assets/images/dcs-game/summon/normal-chest.png');
  });

  it('maps formerly missing currency and hero fallback images to real SVG keys', () => {
    const assets = service();
    expect(assets.resolve('/assets/images/dcs-game/items/gold.png')).toContain('/items/currencies/gold.svg');
    expect(assets.resolve('/assets/images/dcs-game/heroes/default.png')).toBe(assets.placeholder('hero'));
  });

  it('preserves custom-avatar API URLs and their version query', () => {
    const url = 'http://localhost:5000/gateway/dcs-game/player/avatar/custom/12?v=99';
    expect(service().resolve(url)).toBe(url);
  });

  it('allows blob previews and raster data URLs without applying the asset base', () => {
    const assets = service();
    expect(assets.resolve('blob:http://localhost/preview')).toBe('blob:http://localhost/preview');
    expect(assets.resolve('data:image/png;base64,iVBORw0KGgo=')).toBe('data:image/png;base64,iVBORw0KGgo=');
  });

  it('allows explicitly configured external origins', () => {
    expect(service('/assets/', ['https://portraits.example.com']).resolve('https://portraits.example.com/hero.png'))
      .toBe('https://portraits.example.com/hero.png');
  });

  for (const value of ['javascript:alert(1)', 'ftp://example.com/x.png', 'https://unconfigured.example.com/x.png',
    'images/../secret.png', 'images/%2e%2e/secret.png', 'images/%5csecret.png', 'data:image/svg+xml;base64,AAAA', '']) {
    it(`rejects unsupported or invalid input: ${value}`, () => expect(service().resolve(value)).toBe(''));
  }

  it('creates a quoted CSS background using the same resolver', () => {
    const assets = service();
    expect(assets.background('/assets/images/dcs-game/lobby_bg.png')).toBe('url("/assets/images/dcs-game/backgrounds/lobby-bg.png")');
    expect(assets.background(null)).toContain('/placeholders/background.svg');
    expect(assets.placeholder('effect')).toBe('');
  });
});
