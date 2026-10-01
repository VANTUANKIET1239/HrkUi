import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize, Subscription, interval } from 'rxjs';
import { CampaignAtmosphereComponent } from '../../components/campaign-atmosphere/campaign-atmosphere.component';
import { TowerApiService } from '../../../../core/services/tower-api.service';
import { EventRegistryService } from '../../services/event-registry.service';
import { GameEventItem } from '../../../../core/models/event.model';

@Component({
  selector: 'app-campaign-event-list',
  standalone: true,
  imports: [CommonModule, CampaignAtmosphereComponent],
  templateUrl: './campaign-event-list.component.html',
  styleUrl: './campaign-event-list.component.scss'
})
export class CampaignEventListComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly api = inject(TowerApiService);
  private readonly eventRegistry = inject(EventRegistryService);
  private readonly cdr = inject(ChangeDetectorRef);

  events: GameEventItem[] = [];
  loading = true;
  error = '';
  private timerSub?: Subscription;

  ngOnInit(): void {
    this.fetchEvents();
    this.startCountdownTimer();
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  fetchEvents(): void {
    this.loading = true;
    this.error = '';

    this.api.getEvents().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.events = res.data;
        } else {
          this.error = res.message || 'Không thể tải danh sách sự kiện.';
        }
      },
      error: err => {
        this.error = err?.error?.message || 'Lỗi kết nối khi tải sự kiện.';
      }
    });
  }

  private startCountdownTimer(): void {
    this.timerSub = interval(1000).subscribe(() => {
      let changed = false;
      for (const ev of this.events) {
        if (ev.secondsUntilReset > 0) {
          ev.secondsUntilReset--;
          changed = true;
        }
      }
      if (changed) {
        this.cdr.markForCheck();
      }
    });
  }

  formatCountdown(seconds: number): string {
    if (seconds <= 0) return 'Đang cập nhật...';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  openEvent(ev: GameEventItem): void {
    if (ev.status !== 'OPEN') return;
    const targetRoute = this.eventRegistry.getRouteForEvent(ev.eventType);
    this.router.navigate([targetRoute]);
  }

  goToDungeons(): void {
    this.router.navigate(['/dcs-game/campaign/dungeons']);
  }

  backToHome(): void {
    this.router.navigate(['/dcs-game/home']);
  }
}
