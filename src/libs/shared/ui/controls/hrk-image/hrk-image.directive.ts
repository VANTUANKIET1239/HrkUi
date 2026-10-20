import { Directive, ElementRef, EventEmitter, HostListener, inject, Input, OnChanges, Output, Renderer2 } from '@angular/core';
import { AssetUrlService, ImageKind } from '../../../../core/assets/asset-url.service';

// Import once in an image-rendering component; its existing native img elements keep their layout/alt/loading.
@Directive({ selector: 'img', standalone: true })
export class HrkImageDirective implements OnChanges {
  @Input() src: string | null | undefined;
  @Input() imageKind: ImageKind | undefined;
  @Input() imageFallback: string | null | undefined;
  @Output() hrkImageFailed = new EventEmitter<void>();
  private readonly element = inject(ElementRef<HTMLImageElement>);
  private readonly renderer = inject(Renderer2);
  private readonly assets = inject(AssetUrlService);
  private fallbackAttempted = false;
  private currentSource = '';
  private failed = false;

  ngOnChanges(): void {
    this.fallbackAttempted = false;
    this.failed = false;
    this.currentSource = '';
    this.renderer.removeStyle(this.element.nativeElement, 'visibility');
    const source = this.assets.resolve(this.src);
    if (source) this.setSource(source);
    else this.onError();
  }

  @HostListener('error')
  onError(): void {
    if (this.failed) return;
    const resolved = this.assets.resolve(this.src);
    const classes = this.element.nativeElement.className;
    const kind = this.imageKind ?? (/\/(skill-vfx|skills)\//.test(resolved) ? 'effect'
      : /\/(backgrounds|dungeons)\//.test(resolved) && /banner|background|card-bg/.test(classes) ? 'background'
      : /\/heroes\//.test(resolved) || /avatar|portrait|hero-full-art/.test(classes) ? 'hero' : 'item');
    const fallback = this.imageFallback === undefined
      ? this.assets.placeholder(kind) : this.assets.resolve(this.imageFallback);
    if (!this.fallbackAttempted && fallback && fallback !== this.currentSource) {
      this.fallbackAttempted = true;
      this.setSource(fallback);
      return;
    }
    this.fallbackAttempted = true;
    this.failed = true;
    this.renderer.removeAttribute(this.element.nativeElement, 'src');
    this.renderer.setStyle(this.element.nativeElement, 'visibility', 'hidden');
    this.hrkImageFailed.emit();
  }

  private setSource(source: string): void {
    this.currentSource = source;
    this.renderer.setAttribute(this.element.nativeElement, 'src', source);
  }
}
