import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleSceneComponent } from '../../components/battle-scene/battle-scene.component';
import { BattleApiService } from '../../../../core/services/battle-api.service';
import { BattleEngineService } from '../../../../core/services/battle-engine.service';

@Component({
  selector: 'app-battle-page',
  standalone: true,
  imports: [CommonModule, BattleSceneComponent],
  templateUrl: './battle-page.component.html',
  styleUrl: './battle-page.component.scss'
})
export class BattlePageComponent implements OnInit {
  private readonly battleApi = inject(BattleApiService);
  private readonly battleEngine = inject(BattleEngineService);
  isLoading = true;
  loadError = '';

  ngOnInit(): void {
    this.battleEngine.resetBattle();
    // Main campaign starts a real server-authoritative simulation.
    this.battleApi.start({ battleType: 'CAMPAIGN', stageId: 1, randomSeed: 20260920 }).subscribe({
      next: response => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.battleEngine.loadServerBattle(response.data);
          return;
        }
        this.loadError = response.message || 'Không thể khởi tạo trận đấu.';
      },
      error: error => {
        this.isLoading = false;
        this.loadError = error?.error?.message || error?.message || 'Không thể kết nối battle service.';
      }
    });
  }
}
export default BattlePageComponent;
