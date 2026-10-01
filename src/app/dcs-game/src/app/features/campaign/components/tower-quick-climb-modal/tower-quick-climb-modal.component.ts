import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { isQuickClimbFinished } from '../../../../core/services/tower-response.mapper';
import { CommonModule } from '@angular/common';
import { Subscription, interval, finalize } from 'rxjs';
import { TowerApiService } from '../../../../core/services/tower-api.service';
import { TowerQuickClimbJob } from '../../../../core/models/event.model';

@Component({
  selector: 'app-tower-quick-climb-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tower-quick-climb-modal.component.html',
  styleUrl: './tower-quick-climb-modal.component.scss'
})
export class TowerQuickClimbModalComponent implements OnInit, OnDestroy {
  private readonly api = inject(TowerApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() jobId?: string;
  @Output() close = new EventEmitter<void>();
  @Output() viewLastBattle = new EventEmitter<string>();
  @Output() refreshTower = new EventEmitter<void>();

  job?: TowerQuickClimbJob;
  loading = true;
  stopping = false;
  error = '';
  private pollSub?: Subscription;
  private requestSub?: Subscription;
  private polling = false;

  ngOnInit(): void {
    this.pollJob();
    this.pollSub = interval(1500).subscribe(() => {
      if (this.job && this.isJobFinished(this.job.status)) {
        return; // Stopped polling
      }
      this.pollJob(true);
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.requestSub?.unsubscribe();
  }

  pollJob(silent = false): void {
    if (this.polling) return;
    this.polling = true;
    if (!silent) this.loading = true;

    const req$ = this.jobId
      ? this.api.getQuickClimbJob(this.jobId)
      : this.api.getCurrentQuickClimb();

    this.requestSub = req$.pipe(
      finalize(() => {
        this.polling = false;
        if (!silent) this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.job = res.data;
          if (this.isJobFinished(this.job.status)) {
            this.refreshTower.emit();
          }
        } else if (!silent) {
          this.error = res.message || 'Không tìm thấy phiên leo nhanh.';
        }
      },
      error: err => {
        if (!silent) {
          this.error = err?.error?.message || 'Lỗi khi tải thông tin leo nhanh.';
        }
      }
    });
  }

  stopQuickClimb(): void {
    if (this.stopping || !this.job) return;
    this.stopping = true;

    this.api.stopQuickClimb(this.job.jobId).pipe(
      finalize(() => {
        this.stopping = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.pollJob(true);
      },
      error: err => {
        alert(err?.error?.message || 'Không thể dừng phiên leo nhanh.');
      }
    });
  }

  isJobFinished(status?: string): boolean {
    if (!status) return false;
    return isQuickClimbFinished(status);
  }

  get stopReasonText(): string {
    switch (this.job?.stopReason) {
      case 'FIRST_DEFEAT':
        return `Dừng ngay ở trận thua đầu tiên (Tầng ${this.job.failedFloor || this.job.currentFloor})`;
      case 'TOWER_COMPLETED':
        return `Chinh phục toàn bộ ${this.job?.targetFloor} tầng tháp thành công!`;
      case 'USER_CANCELLED':
        return 'Người chơi đã yêu cầu dừng';
      case 'PERIOD_EXPIRED':
        return 'Đã đến thời điểm làm mới kỳ sự kiện';
      case 'EVENT_CLOSED':
        return 'Sự kiện đã kết thúc';
      case 'LIVES_EXHAUSTED':
        return 'Lượt leo đã hết mạng theo cấu hình sự kiện';
      case 'ERROR':
        return 'Dừng do lỗi hệ thống';
      default:
        return 'Phiên leo nhanh kết thúc';
    }
  }

  onViewBattleDetails(): void {
    if (this.job?.lastBattleId) {
      this.viewLastBattle.emit(this.job.lastBattleId);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
