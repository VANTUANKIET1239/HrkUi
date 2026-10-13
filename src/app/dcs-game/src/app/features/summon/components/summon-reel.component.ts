import { HrkModalComponent } from '../../../../../../../libs/shared/ui/modal/hrk-modal.component';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  signal
} from '@angular/core';
import { SummonHero, SummonReward } from '../../../core/models/summon.model';
import { SummonHeroCardComponent } from './summon-hero-card.component';

@Component({
  selector: 'app-summon-reel',
  standalone: true,
  imports: [SummonHeroCardComponent, HrkModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hrk-modal modalCode="SUMMON_REEL" title="Chiêu mộ võ tướng" size="FULLSCREEN" [chrome]="false" [closeOnBackdrop]="false" (closed)="finish()">
    <div class="reel-layout">
      <div class="reel-dialog" [style.--winner-color]="winner.rarityColorHex || '#f4d785'">
        <span class="eyebrow">MỘT GIAO ƯỚC MỚI</span>
        <h2 id="reel-title">Ai sẽ đồng hành cùng bạn?</h2>

        <div class="reel-viewport" #viewport aria-hidden="true">
          <div class="reel-spotlight"></div>
          <div class="reel-track" #track>
            @for (hero of cards; track $index) {
              <app-summon-hero-card
                [hero]="hero"
                [class.winner-highlight]="winnerRevealed() && $index === winnerIndex"
                [attr.data-winner]="$index === winnerIndex ? '' : null"
              />
            }
          </div>
          <div class="reel-pointer" [class.winner-active]="winnerRevealed()"></div>
        </div>

        @if (winnerRevealed()) {
          <p class="status-message winner-reveal">
            <i class="bi bi-stars"></i> Đã nhận: <strong>{{ winner.name }}</strong> ({{ winner.rarityName }})
          </p>
        } @else {
          <p class="status-message">Vận mệnh đang hé mở…</p>
        }

        <button type="button" #skip (click)="finish()">
          Bỏ qua hiệu ứng <i class="bi bi-chevron-double-right"></i>
        </button>
      </div>
    </div>
    </hrk-modal>
  `,
  styleUrl: './summon-reel.component.scss'
})
export class SummonReelComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input({ required: true }) winner!: SummonReward;
  @Input({ required: true }) pool!: SummonHero[];
  @Output() completed = new EventEmitter<void>();

  @ViewChild('viewport', { static: true }) viewport!: ElementRef<HTMLElement>;
  @ViewChild('track', { static: true }) track!: ElementRef<HTMLElement>;
  @ViewChild('skip', { static: true }) skip!: ElementRef<HTMLButtonElement>;

  readonly winnerIndex = 48;
  readonly winnerRevealed = signal(false);
  cards: SummonHero[] = [];

  private animation?: Animation;
  private resizeObserver?: ResizeObserver;
  private revealTimeout?: ReturnType<typeof setTimeout>;
  private finished = false;

  constructor(private readonly cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.cards.length === 0) {
      this.generateCards();
    }
  }

  ngOnChanges(_changes?: SimpleChanges): void {
    this.generateCards();
  }

  private generateCards(): void {
    if (!this.winner) return;
    const pool = this.pool?.length ? this.pool : [this.winner];
    const totalCards = 65;
    const items: SummonHero[] = [];
    let prevHeroId = -1;

    for (let i = 0; i < totalCards; i++) {
      if (i === this.winnerIndex) {
        items.push(this.winner);
        prevHeroId = this.winner.heroTemplateId;
      } else {
        let hero: SummonHero;
        if (pool.length > 1) {
          const alternatives = pool.filter(h => h.heroTemplateId !== prevHeroId);
          const poolChoices = alternatives.length > 0 ? alternatives : pool;
          hero = poolChoices[Math.floor(Math.random() * poolChoices.length)];
        } else {
          hero = pool[0];
        }
        items.push(hero);
        prevHeroId = hero.heroTemplateId;
      }
    }
    this.cards = items;
  }

  ngAfterViewInit(): void {
    this.skip.nativeElement.focus();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !this.track.nativeElement.animate) {
      queueMicrotask(() => this.finish());
      return;
    }

    const viewport = this.viewport.nativeElement;
    const track = this.track.nativeElement;
    const winnerEl = (track.children[this.winnerIndex] as HTMLElement) || (track.firstElementChild as HTMLElement);

    const viewportRect = viewport.getBoundingClientRect();
    const winnerRect = winnerEl.getBoundingClientRect();
    const target = (viewportRect.left + viewportRect.width / 2) - (winnerRect.left + winnerRect.width / 2);

    this.animation = track.animate(
      [
        { transform: 'translateX(0)' },
        { transform: `translateX(${target}px)` }
      ],
      {
        duration: 5200,
        easing: 'cubic-bezier(0.12, 0.8, 0.14, 1)',
        fill: 'forwards'
      }
    );

    this.animation.finished.then(() => {
      this.handleAnimationFinished();
    }, () => {});

    const initialWidth = viewport.clientWidth;
    this.resizeObserver = new ResizeObserver(() => {
      if (Math.abs(viewport.clientWidth - initialWidth) > 1) this.finish();
    });
    this.resizeObserver.observe(viewport);
  }

  handleAnimationFinished(): void {
    if (this.finished) return;
    this.winnerRevealed.set(true);
    this.cdRef.markForCheck();
    this.revealTimeout = setTimeout(() => {
      this.finish();
    }, 1100);
  }

  finish(): void {
    if (this.finished) return;
    this.finished = true;
    if (this.revealTimeout) {
      clearTimeout(this.revealTimeout);
      this.revealTimeout = undefined;
    }
    this.animation?.cancel();
    this.resizeObserver?.disconnect();
    this.completed.emit();
  }

  ngOnDestroy(): void {
    this.finished = true;
    if (this.revealTimeout) {
      clearTimeout(this.revealTimeout);
      this.revealTimeout = undefined;
    }
    this.animation?.cancel();
    this.resizeObserver?.disconnect();
  }
}

