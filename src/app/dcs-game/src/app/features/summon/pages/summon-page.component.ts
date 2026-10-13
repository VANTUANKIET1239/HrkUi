import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppError, toAppError } from '../../../../../../../libs/core/http/hrk-api/app-error';
import { SummonConfiguration, SummonCount, SummonPool, SummonRequest, SummonResult } from '../../../core/models/summon.model';
import { SummonService } from '../../../core/services/summon.service';
import { GameToastService } from '../../../core/services/game-toast.service';
import { SummonChestComponent } from '../components/summon-chest.component';
import { SummonReelComponent } from '../components/summon-reel.component';
import { SummonResultModalComponent } from '../components/summon-result-modal.component';
import { SummonDialogComponent } from '../components/summon-dialog.component';
import { SummonHeroCardComponent } from '../components/summon-hero-card.component';

type Phase = 'idle' | 'requesting' | 'reel' | 'result' | 'uncertain';

@Component({
  selector: 'app-summon-page', standalone: true,
  imports: [DecimalPipe, RouterLink, SummonChestComponent, SummonReelComponent, SummonResultModalComponent, SummonDialogComponent, SummonHeroCardComponent],
  templateUrl: './summon-page.component.html', styleUrl: './summon-page.component.scss'
})
export class SummonPageComponent implements OnInit {
  private readonly api = inject(SummonService);
  private readonly toast = inject(GameToastService);
  private readonly destroyRef = inject(DestroyRef);
  readonly configuration = signal<SummonConfiguration | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly phase = signal<Phase>('idle');
  readonly result = signal<SummonResult | null>(null);
  readonly selectedPool = signal<SummonPool | null>(null);
  readonly activePoolCode = signal('');
  readonly busy = computed(() => this.phase() !== 'idle');
  readonly reelPool = computed(() => this.configuration()?.pools.find(x => x.code === this.result()?.poolCode)?.heroes ?? []);
  readonly canRepeat = computed(() => {
    const result = this.result();
    const pool = this.configuration()?.pools.find(x => x.code === result?.poolCode);
    return !!result && !!pool && this.balance(pool) >= (result.count === 1 ? pool.singleCost : pool.tenCost);
  });
  private pending: SummonRequest | null = null;
  private configurationGeneration = 0;

  ngOnInit(): void { this.loadConfiguration(true); }

  loadConfiguration(restore = false): void {
    const generation = ++this.configurationGeneration;
    if (!this.configuration()) this.loading.set(true);
    this.loadError.set('');
    this.api.configuration().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        if (generation !== this.configurationGeneration) return;
        this.loading.set(false);
        if (!response.success || !response.data) { this.loadError.set('Không thể tải thông tin chiêu mộ.'); return; }
        this.configuration.set(response.data);
        if (restore && this.readPending()) this.recover();
      },
      error: error => {
        if (generation !== this.configurationGeneration) return;
        this.loading.set(false);
        if (!this.configuration()) this.loadError.set('Không thể tải thông tin chiêu mộ. Vui lòng thử lại.');
        else this.toast.fromError(error, 'Không thể cập nhật số dư.');
      }
    });
  }

  balance(pool: SummonPool): number {
    const wallet = this.configuration()?.wallet;
    return (pool.currency === 'GOLD' ? wallet?.gold : wallet?.diamonds) ?? 0;
  }

  open(pool: SummonPool, count: SummonCount): void {
    if (this.busy() || !this.configuration()) return;
    if (this.balance(pool) < (count === 1 ? pool.singleCost : pool.tenCost)) {
      this.toast.warning('Không đủ tài nguyên để chiêu mộ.');
      return;
    }
    this.pending = { requestId: crypto.randomUUID(), poolCode: pool.code, count };
    this.savePending();
    this.sendPending();
  }

  recover(): void {
    if (!this.pending || this.phase() === 'requesting') return;
    const request = this.pending;
    this.activePoolCode.set(request.poolCode);
    this.phase.set('requesting');
    this.api.result(request.requestId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        if (response.success && response.data) {
          this.accept(response.data);
          if (this.phase() !== 'uncertain') this.loadConfiguration();
        }
        else this.handleFailure(new Error('Invalid summon receipt.'));
      },
      error: error => {
        if (toAppError(error).code === 'SUMMON_RESULT_NOT_FOUND') this.sendPending();
        else this.handleFailure(error);
      }
    });
  }

  onReelComplete(): void { if (this.result()) this.phase.set('result'); }

  closeResult(): void {
    this.clearPending();
    this.result.set(null);
    this.phase.set('idle');
    this.activePoolCode.set('');
    this.loadConfiguration();
  }

  repeat(): void {
    const result = this.result();
    const pool = this.configuration()?.pools.find(x => x.code === result?.poolCode);
    if (!result || !pool || !this.canRepeat()) return;
    this.clearPending();
    this.result.set(null);
    this.phase.set('idle');
    this.open(pool, result.count);
  }

  private sendPending(): void {
    if (!this.pending) return;
    ++this.configurationGeneration;
    this.activePoolCode.set(this.pending.poolCode);
    this.phase.set('requesting');
    this.api.summon(this.pending).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        if (response.success && response.data) this.accept(response.data);
        else this.handleFailure(new AppError(409, 'SUMMON_FAILED', response.message || 'Không thể chiêu mộ.', 'business'));
      },
      error: error => this.handleFailure(error)
    });
  }

  private accept(result: SummonResult): void {
    if (!this.pending || result.requestId !== this.pending.requestId || result.poolCode !== this.pending.poolCode
      || result.count !== this.pending.count || result.items.length !== result.count) {
      this.handleFailure(new Error('Unexpected summon receipt.'));
      return;
    }
    this.configuration.update(config => config ? { ...config, wallet: result.wallet } : config);
    this.result.set(result);
    this.phase.set(result.count === 1 ? 'reel' : 'result');
    // Keep the receipt request until acknowledged, including refreshes during animation.
  }

  private handleFailure(error: unknown): void {
    const failure = toAppError(error);
    this.toast.fromError(failure, 'Không thể xác nhận kết quả chiêu mộ. Vui lòng kiểm tra lại.');
    if (failure.expected && failure.status !== 401) {
      this.clearPending();
      this.phase.set('idle');
      this.activePoolCode.set('');
      this.loadConfiguration();
    } else this.phase.set('uncertain');
  }

  private get storageKey(): string { return `hrk.summon.pending:${this.configuration()!.playerId}`; }
  private savePending(): void {
    try { sessionStorage.setItem(this.storageKey, JSON.stringify(this.pending)); }
    catch { this.toast.info('Hãy giữ trang này mở để kiểm tra kết quả nếu kết nối bị gián đoạn.'); }
  }
  private readPending(): boolean {
    try {
      const value: unknown = JSON.parse(sessionStorage.getItem(this.storageKey) || 'null');
      if (value && typeof value === 'object') {
        const saved = value as Partial<SummonRequest>;
        if (typeof saved.requestId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(saved.requestId)
          && typeof saved.poolCode === 'string' && saved.poolCode.length <= 30 && (saved.count === 1 || saved.count === 10)) {
          this.pending = saved as SummonRequest;
          return true;
        }
      }
    } catch { /* Storage unavailable or an invalid old receipt. */ }
    return false;
  }
  private clearPending(): void {
    this.pending = null;
    try { sessionStorage.removeItem(this.storageKey); } catch { /* In-memory state still clears. */ }
  }
}
