import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HrkImageDirective } from './hrk-image.directive';

@Component({ standalone: true, imports: [HrkImageDirective], template: `
  <img [src]="source" [imageKind]="kind" [imageFallback]="fallback" (hrkImageFailed)="failures = failures + 1"
    alt="Hero portrait" width="64" loading="eager" />
` })
class ImageProbe {
  source = '/assets/images/dcs-game/kiet.png';
  kind: 'hero' | 'item' | 'effect' = 'hero';
  fallback: string | undefined;
  failures = 0;
}

describe('HrkImageDirective', () => {
  async function create() {
    await TestBed.configureTestingModule({ imports: [ImageProbe] }).compileComponents();
    const fixture = TestBed.createComponent(ImageProbe);
    fixture.detectChanges();
    return { fixture, image: fixture.nativeElement.querySelector('img') as HTMLImageElement, probe: fixture.componentInstance };
  }

  it('resolves existing src bindings and preserves accessibility, sizing and loading', async () => {
    const { image } = await create();
    expect(image.getAttribute('src')).toBe('/assets/images/dcs-game/heroes/kiet.png');
    expect(image.alt).toBe('Hero portrait');
    expect(image.width).toBe(64);
    expect(image.loading).toBe('eager');
  });

  it('tries a placeholder once, then stops even if repeated error events arrive', async () => {
    const { image, probe } = await create();
    image.dispatchEvent(new Event('error'));
    expect(image.getAttribute('src')).toContain('/placeholders/hero.svg');
    image.dispatchEvent(new Event('error'));
    image.dispatchEvent(new Event('error'));
    expect(image.hasAttribute('src')).toBeFalse();
    expect(image.style.visibility).toBe('hidden');
    expect(probe.failures).toBe(1);
  });

  it('resets the fallback attempt and visibility when the source changes', async () => {
    const { fixture, image, probe } = await create();
    image.dispatchEvent(new Event('error'));
    image.dispatchEvent(new Event('error'));
    probe.source = 'images/dcs-game/heroes/ricardo-milos.png';
    fixture.detectChanges();
    expect(image.style.visibility).toBe('');
    expect(image.getAttribute('src')).toContain('/heroes/ricardo-milos.png');
    image.dispatchEvent(new Event('error'));
    expect(image.getAttribute('src')).toContain('/placeholders/hero.svg');
  });

  it('lets effects retain their own CSS fallback without showing item/hero placeholders', async () => {
    const { fixture, image, probe } = await create();
    probe.kind = 'effect';
    fixture.detectChanges();
    image.dispatchEvent(new Event('error'));
    expect(image.hasAttribute('src')).toBeFalse();
    expect(probe.failures).toBe(1);
  });

  it('resolves a custom fallback and handles an empty main source', async () => {
    const { fixture, image, probe } = await create();
    probe.source = '';
    probe.fallback = 'images/dcs-game/items/currencies/gold.svg';
    fixture.detectChanges();
    expect(image.getAttribute('src')).toBe('/assets/images/dcs-game/items/currencies/gold.svg');
  });
});
