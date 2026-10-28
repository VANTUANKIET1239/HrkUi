import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameToast } from '../../../core/models/game-toast.model';
import { GameToastService } from '../../../core/services/game-toast.service';

interface ToastClock {
  timeout?: ReturnType<typeof setTimeout>;
  remainingMs: number;
  startedAt: number;
  pauses: Set<'hover' | 'focus'>;
}

@Component({
  selector: 'app-game-toast',
  standalone: true,
  imports: [HrkTranslatePipe],
  templateUrl: './game-toast.component.html',
  styleUrl: './game-toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameToastComponent {
  private readonly service = inject(GameToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clocks = new Map<string, ToastClock>();
  readonly toasts = signal<readonly GameToast[]>([]);
  readonly titles = { success: 'Thành công', warning: 'Lưu ý', info: 'Thông báo', error: 'Có lỗi xảy ra' };
  readonly icons = { success: 'bi-check2-circle', warning: 'bi-exclamation-triangle', info: 'bi-info-circle', error: 'bi-x-octagon' };

  constructor() {
    this.service.events$.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event.action === 'show') this.show(event.toast);
      else if (event.action === 'dismiss') this.remove(event.id);
      else this.clear();
    });
    this.destroyRef.onDestroy(() => this.clear());
  }

  dismiss(id: string): void { this.service.dismiss(id); }

  pause(id: string, reason: 'hover' | 'focus'): void {
    const clock = this.clocks.get(id);
    if (!clock || clock.pauses.has(reason)) return;
    if (clock.pauses.size === 0) {
      clearTimeout(clock.timeout);
      clock.remainingMs = Math.max(0, clock.remainingMs - (Date.now() - clock.startedAt));
    }
    clock.pauses.add(reason);
  }

  resume(id: string, reason: 'hover' | 'focus'): void {
    const clock = this.clocks.get(id);
    if (!clock || !clock.pauses.delete(reason) || clock.pauses.size > 0) return;
    this.schedule(id, clock);
  }

  private show(toast: GameToast): void {
    const current = this.toasts();
    const existingClock = this.clocks.get(toast.id);
    const pauses = existingClock?.pauses ?? new Set<'hover' | 'focus'>();
    this.stopClock(toast.id);
    const visible = current.filter(item => item.id !== toast.id);
    while (visible.length >= 3) this.stopClock(visible.shift()!.id);
    this.toasts.set([...visible, toast]);
    if (toast.durationMs === 0) return;
    const clock: ToastClock = { remainingMs: toast.durationMs, startedAt: Date.now(), pauses };
    this.clocks.set(toast.id, clock);
    if (pauses.size === 0) this.schedule(toast.id, clock);
  }

  private schedule(id: string, clock: ToastClock): void {
    clock.startedAt = Date.now();
    clock.timeout = setTimeout(() => this.remove(id), clock.remainingMs);
  }

  private remove(id: string): void {
    this.stopClock(id);
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  private stopClock(id: string): void {
    clearTimeout(this.clocks.get(id)?.timeout);
    this.clocks.delete(id);
  }

  private clear(): void {
    for (const id of this.clocks.keys()) this.stopClock(id);
    this.toasts.set([]);
  }
}
