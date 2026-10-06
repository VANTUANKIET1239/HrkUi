import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { isQuickClimbFinished } from '../../../../core/services/tower-response.mapper';
import { CommonModule } from '@angular/common';
import { Subscription, interval, finalize } from 'rxjs';
import { TowerApiService } from '../../../../core/services/tower-api.service';
import { TowerQuickClimbJob } from '../../../../core/models/event.model';
import { ProcessRealtimeService } from '../../../../core/services/process-realtime.service';

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
  private readonly realtime = inject(ProcessRealtimeService);

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
  private realtimeSub?: Subscription;
  private reconnectSub?: Subscription;

  ngOnInit(): void {
    this.pollJob();
    void this.realtime.connect().catch(() => {
      // REST polling below remains the source-of-truth fallback.
    });
    this.realtimeSub = this.realtime.allEvents().subscribe(event => {
      const activeJobId = this.job?.jobId ?? this.jobId;
      if (event.processType === 'TOWER_QUICK_CLIMB' && event.jobId === activeJobId) {
        this.pollJob(true);
      }
    });
    this.reconnectSub = this.realtime.reconnected$.subscribe(() => this.pollJob(true));
    this.pollSub = interval(15000).subscribe(() => {
      if (this.job && this.isJobFinished(this.job.status)) {
        return; // Stopped polling
      }
      this.pollJob(true);
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.requestSub?.unsubscribe();
    this.realtimeSub?.unsubscribe();
    this.reconnectSub?.unsubscribe();
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

  get progressPercent(): number {
    if (!this.job || this.job.targetFloor <= 0) return 0;
    if (this.job.status === 'COMPLETED') return 100;
    return Math.min(100, Math.max(0,
      Math.round(this.job.clearedFloorsCount * 100 / this.job.targetFloor)));
  }

  get progressStateText(): string {
    if (!this.job) return '';
    if (this.job.status === 'COMPLETED') return 'Hoàn thành';
    if (this.job.status === 'STOPPED_DEFEAT') return `Dừng tại tầng ${this.job.failedFloor ?? this.job.currentFloor}`;
    if (this.job.status === 'CANCELLED') return 'Đã dừng';
    if (this.job.status === 'ERROR') return 'Gián đoạn';
    return `Đang đánh tầng ${this.job.currentFloor}`;
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
      case 'RULES_CHANGED':
        return 'Phiên cũ đã dừng do luật leo nhanh được cập nhật';
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
