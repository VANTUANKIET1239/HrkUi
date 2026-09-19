import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly _activeCount = signal<number>(0);
  private readonly _isVisible = signal<boolean>(false);
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly SHOW_DELAY_MS = 200;

  /**
   * Computed boolean indicating whether the global loading overlay is visible.
   */
  readonly isLoading = computed(() => this._isVisible());

  /**
   * Computed number of active global loading requests.
   */
  readonly activeRequestsCount = computed(() => this._activeCount());

  /**
   * Increments the global request counter.
   * Delays showing the overlay by 200ms to avoid UI flickering for fast API responses,
   * unless `immediate` is set to true.
   * @param immediate If true, skips the debounce delay and activates overlay immediately.
   */
  show(immediate: boolean = false): void {
    this._activeCount.update(count => count + 1);

    if (this._isVisible()) {
      return;
    }

    if (immediate) {
      if (this.showTimer !== null) {
        clearTimeout(this.showTimer);
        this.showTimer = null;
      }
      this._isVisible.set(true);
    } else if (this.showTimer === null) {
      this.showTimer = setTimeout(() => {
        if (this._activeCount() > 0) {
          this._isVisible.set(true);
        }
        this.showTimer = null;
      }, this.SHOW_DELAY_MS);
    }
  }

  /**
   * Decrements the global request counter.
   * Counter is guaranteed never to become negative.
   * When counter reaches 0, cancels any pending delay timer and hides the overlay.
   */
  hide(): void {
    this._activeCount.update(count => Math.max(0, count - 1));

    if (this._activeCount() === 0) {
      if (this.showTimer !== null) {
        clearTimeout(this.showTimer);
        this.showTimer = null;
      }
      this._isVisible.set(false);
    }
  }

  /**
   * Clears all pending timers, resets counter to 0, and dismisses overlay immediately.
   */
  reset(): void {
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    this._activeCount.set(0);
    this._isVisible.set(false);
  }
}
