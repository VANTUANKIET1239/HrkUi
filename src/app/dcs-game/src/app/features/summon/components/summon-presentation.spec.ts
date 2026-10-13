import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummonReelComponent } from './summon-reel.component';
import { SummonResultModalComponent } from './summon-result-modal.component';
import { SummonHero, SummonReward, SummonResult } from '../../../core/models/summon.model';

const hero: SummonHero = { heroTemplateId: 1, name: 'Võ tướng', avatar: '/assets/images/dcs-game/summon/normal-chest.png', rarityCode: 'RARE', rarityName: 'Hiếm', rarityColorHex: '#5b9bd5' };
const winner: SummonReward = { ...hero, heroTemplateId: 2, name: 'Tướng kết quả', drawIndex: 0, isNew: true, stoneQuantity: 0 };

describe('Summon presentation', () => {
  let reel: ComponentFixture<SummonReelComponent> | undefined;
  let modal: ComponentFixture<SummonResultModalComponent> | undefined;
  let style: HTMLStyleElement | undefined;
  beforeEach(() => TestBed.configureTestingModule({ imports: [SummonReelComponent, SummonResultModalComponent] }));
  afterEach(() => { reel?.destroy(); modal?.destroy(); style?.remove(); reel = undefined; modal = undefined; style = undefined; });

  function createReel(): void {
    reel = TestBed.createComponent(SummonReelComponent);
    reel.componentRef.setInput('winner', winner);
    reel.componentRef.setInput('pool', [hero]);
  }

  for (const width of [680, 320]) {
    it(`aligns the server-selected hero with the marker in a ${width}px viewport`, () => {
      style = document.createElement('style');
      style.textContent = `.reel-dialog { width: ${width}px !important; }`;
      document.head.append(style);
      createReel(); reel!.detectChanges();
      const viewport: HTMLElement = reel!.nativeElement.querySelector('.reel-viewport');
      const track: HTMLElement = reel!.nativeElement.querySelector('.reel-track');
      const animation = track.getAnimations()[0];
      expect(animation).toBeDefined();
      animation.pause();
      animation.currentTime = 5200;
      const selected = track.children[reel!.componentInstance.winnerIndex].getBoundingClientRect();
      const bounds = viewport.getBoundingClientRect();
      expect(Math.abs((selected.left + selected.right) / 2 - (bounds.left + bounds.right) / 2)).toBeLessThan(1);
      expect(track.children[reel!.componentInstance.winnerIndex].textContent).toContain('Tướng kết quả');
    });
  }

  it('lets the player skip once and cancels the animation', () => {
    createReel(); reel!.detectChanges();
    const done = jasmine.createSpy('completed');
    reel!.componentInstance.completed.subscribe(done);
    (reel!.nativeElement.querySelector('button') as HTMLButtonElement).click();
    reel!.componentInstance.finish();
    expect(done).toHaveBeenCalledTimes(1);
    expect((reel!.nativeElement.querySelector('.reel-track') as HTMLElement).getAnimations()).toEqual([]);
  });

  it('goes straight to the receipt when reduced motion is requested', async () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: true } as MediaQueryList);
    createReel();
    const done = jasmine.createSpy('completed');
    reel!.componentInstance.completed.subscribe(done);
    reel!.detectChanges();
    await reel!.whenStable();
    expect(done).toHaveBeenCalledTimes(1);
    expect((reel!.nativeElement.querySelector('.reel-track') as HTMLElement).getAnimations()).toEqual([]);
  });

  it('renders all ten draws even when they contain the same hero, with new/duplicate feedback', () => {
    modal = TestBed.createComponent(SummonResultModalComponent);
    const result: SummonResult = { requestId: 'receipt', poolCode: 'NORMAL', count: 10, currency: 'GOLD', cost: 100,
      wallet: { gold: 900, diamonds: 0 }, items: Array.from({ length: 10 }, (_, index) => ({ ...winner, drawIndex: index, isNew: index === 0, stoneQuantity: index === 0 ? 0 : 20 })) };
    modal.componentRef.setInput('result', result);
    modal.detectChanges();
    expect(modal.nativeElement.querySelectorAll('app-summon-hero-card').length).toBe(10);
    expect(modal.nativeElement.querySelectorAll('.new-tag').length).toBe(1);
    expect(modal.nativeElement.querySelectorAll('.stones').length).toBe(9);
    expect(modal.nativeElement.querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true');
    expect(modal.nativeElement.querySelector('button.again').disabled).toBeTrue();
  });

  it('highlights the winner card and waits for a beat before emitting completed', () => {
    jasmine.clock().install();
    try {
      createReel();
      reel!.detectChanges();
      const done = jasmine.createSpy('completed');
      reel!.componentInstance.completed.subscribe(done);
      reel!.componentInstance.handleAnimationFinished();
      reel!.detectChanges();
      expect(reel!.componentInstance.winnerRevealed()).toBeTrue();
      const track: HTMLElement = reel!.nativeElement.querySelector('.reel-track');
      const winnerCard = track.children[reel!.componentInstance.winnerIndex];
      expect(winnerCard.classList.contains('winner-highlight')).toBeTrue();
      expect(done).not.toHaveBeenCalled();
      jasmine.clock().tick(1100);
      expect(done).toHaveBeenCalledTimes(1);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('diversifies adjacent filler cards when pool has multiple options', () => {
    const hero2: SummonHero = { heroTemplateId: 3, name: 'Võ tướng 2', avatar: '/hero2.png', rarityCode: 'EPIC', rarityName: 'Sử thi' };
    reel = TestBed.createComponent(SummonReelComponent);
    reel.componentRef.setInput('winner', winner);
    reel.componentRef.setInput('pool', [hero, hero2]);
    reel.detectChanges();
    expect(reel.componentInstance.cards.length).toBe(65);
    expect(reel.componentInstance.cards[reel.componentInstance.winnerIndex]).toEqual(winner);
    const fillerIds = new Set(reel!.componentInstance.cards.filter((_, i) => i !== reel!.componentInstance.winnerIndex).map(c => c.heroTemplateId));
    expect(fillerIds.size).toBeGreaterThan(1);
  });
});
