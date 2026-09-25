import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DungeonMap, DungeonStamina } from '../../../../core/models/dungeon.model';
import { DungeonApiService } from '../../../../core/services/dungeon-api.service';
import { CampaignMapCardComponent } from '../../components/campaign-map-card/campaign-map-card.component';
import { CampaignAtmosphereComponent } from '../../components/campaign-atmosphere/campaign-atmosphere.component';

@Component({
  selector: 'app-campaign-map-list',
  standalone: true,
  imports: [
    CommonModule,
    CampaignMapCardComponent,
    CampaignAtmosphereComponent
  ],
  templateUrl: './campaign-map-list.component.html',
  styleUrl: './campaign-map-list.component.scss'
})
export class CampaignMapListComponent implements OnInit {
  private readonly api = inject(DungeonApiService);
  private readonly router = inject(Router);

  maps: DungeonMap[] = [];
  stamina?: DungeonStamina;
  loading = true;
  error = '';
  purchasing = false;

  ngOnInit(): void {
    this.fetchMaps();
    this.refreshStamina();
  }

  fetchMaps(): void {
    this.loading = true;
    this.error = '';
    this.api.maps().subscribe({
      next: r => {
        this.loading = false;
        if (r.success) {
          this.maps = r.data ?? [];
        } else {
          this.error = r.message || 'Không thể tải danh sách bản đồ.';
        }
      },
      error: e => {
        this.loading = false;
        this.error = e?.error?.message ?? 'Không tải được danh sách bản đồ chiến dịch.';
      }
    });
  }

  refreshStamina(): void {
    this.api.stamina().subscribe({
      next: r => {
        if (r.success) {
          this.stamina = r.data;
        }
      }
    });
  }

  open(map: DungeonMap): void {
    if (map.state === 'AVAILABLE' || map.state === 'COMPLETED') {
      this.router.navigate(['/dcs-game/campaign/maps', map.id]);
    }
  }

  buy(): void {
    if (this.purchasing || (this.stamina?.purchaseCount ?? 0) >= 10) return;
    this.purchasing = true;
    this.error = '';
    this.api.purchaseStamina().subscribe({
      next: r => {
        this.purchasing = false;
        if (r.success) {
          this.stamina = r.data;
        } else {
          this.error = r.message || 'Không mua được thể lực.';
        }
      },
      error: e => {
        this.purchasing = false;
        this.error = e?.error?.message ?? 'Không mua được thể lực.';
      }
    });
  }

  back(): void {
    this.router.navigate(['/dcs-game/home']);
  }
}
