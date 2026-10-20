import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize, interval } from 'rxjs';
import { toAppError } from '../../../../../../libs/core/http/hrk-api/app-error';
import { HrkImageDirective } from '../../../../../../libs/shared/ui/controls/hrk-image/hrk-image.directive';
import { CheckInCalendar, CheckInClaim, CheckInDay } from '../../core/models/check-in.model';
import { CheckInService } from '../../core/services/check-in.service';

@Component({
  selector: 'app-check-in-page', standalone: true,
  imports: [CommonModule, RouterLink, HrkImageDirective],
  templateUrl: './check-in-page.component.html', styleUrl: './check-in-page.component.scss'
})
export class CheckInPageComponent implements OnInit {
  private readonly api = inject(CheckInService);
  private readonly destroyRef = inject(DestroyRef);
  readonly calendar = signal<CheckInCalendar | null>(null);
  readonly loading = signal(false);
  readonly claiming = signal(false);
  readonly error = signal('');
  readonly receipt = signal<CheckInClaim | null>(null);
  readonly secondsUntilReset = signal(0);
  private pendingRequestId?: string;
  private serverOffset = 0;
  private refreshDue = false;
  readonly weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  ngOnInit(): void {
    this.load();
    interval(1000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const reset = this.calendar()?.nextResetAtUtc;
      if (!reset) return;
      this.secondsUntilReset.set(Math.max(0, Math.ceil((Date.parse(reset) - Date.now() - this.serverOffset) / 1000)));
      if (this.secondsUntilReset() === 0 && !this.refreshDue && !this.claiming()) {
        this.refreshDue = true;
        this.load();
      }
    });
  }

  get leadingDays(): number[] {
    const month = this.calendar()?.monthKey;
    if (!month) return [];
    const [year, value] = month.split('-').map(Number);
    return Array.from({ length: (new Date(Date.UTC(year, value - 1, 1)).getUTCDay() + 6) % 7 }, (_, i) => i);
  }

  get countdown(): string {
    const value = this.secondsUntilReset();
    return [Math.floor(value / 3600), Math.floor(value % 3600 / 60), value % 60].map(x => String(x).padStart(2, '0')).join(':');
  }

  get claimLabel(): string {
    if (this.claiming()) return 'Đang nhận…';
    const data = this.calendar();
    if (data?.canClaim) return 'Nhận quà hôm nay';
    const today = Number(data?.gameDate?.slice(-2));
    return data?.days.some(day => day.dayOfMonth === today && day.status === 'CLAIMED')
      ? 'Đã nhận quà hôm nay' : 'Chưa thể nhận quà';
  }

  label(day: CheckInDay): string {
    return { CLAIMED: 'Đã nhận', CLAIMABLE: 'Hôm nay', MISSED: 'Đã bỏ lỡ', LOCKED: 'Chưa mở' }[day.status];
  }

  load(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.api.getCalendar().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false))).subscribe({
      next: response => {
        if (!response.success || !response.data) { this.error.set(response.message || 'Không thể tải lịch điểm danh.'); return; }
        this.calendar.set(response.data);
        this.serverOffset = Date.parse(response.data.serverTimeUtc) - Date.now();
        this.secondsUntilReset.set(response.data.nextResetAtUtc ? Math.max(0, Math.ceil((Date.parse(response.data.nextResetAtUtc) - Date.parse(response.data.serverTimeUtc)) / 1000)) : 0);
        this.refreshDue = false;
      },
      error: failure => this.error.set(toAppError(failure).message || 'Không thể tải lịch điểm danh.')
    });
  }

  claim(): void {
    if (this.claiming() || this.loading() || !this.calendar()?.canClaim || this.refreshDue) return;
    this.pendingRequestId ??= crypto.randomUUID();
    this.claiming.set(true);
    this.error.set('');
    this.api.claim(this.pendingRequestId).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.claiming.set(false))).subscribe({
      next: response => {
        if (!response.success || !response.data) { this.error.set(response.message || 'Không thể nhận thưởng.'); return; }
        this.pendingRequestId = undefined;
        this.receipt.set(response.data);
        // Disable immediately before refetching; a second click cannot spend another request id on stale state.
        this.calendar.update(value => value ? { ...value, canClaim: false } : value);
        this.load();
      },
      error: failure => this.error.set(toAppError(failure).message || 'Chưa xác nhận được kết quả. Vui lòng thử lại.')
    });
  }
}
