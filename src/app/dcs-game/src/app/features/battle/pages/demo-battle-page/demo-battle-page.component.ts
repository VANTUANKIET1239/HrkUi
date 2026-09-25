import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BattleApiService } from '../../../../core/services/battle-api.service';
import { BattleEngineService } from '../../../../core/services/battle-engine.service';
import { DungeonSessionService } from '../../../../core/services/dungeon-session.service';
import { StartBattleResultDto } from '../../../../core/models/battle.model';
import { BattleSceneComponent } from '../../components/battle-scene/battle-scene.component';

@Component({
  selector: 'app-demo-battle-page',
  standalone: true,
  imports: [CommonModule, BattleSceneComponent],
  templateUrl: './demo-battle-page.component.html',
  styleUrl: './demo-battle-page.component.scss'
})
export class DemoBattlePageComponent implements OnInit {
  private readonly api = inject(BattleApiService);
  private readonly engine = inject(BattleEngineService);
  private readonly dungeonSession = inject(DungeonSessionService);
  battle?: StartBattleResultDto;
  loading = true;
  error = '';

  ngOnInit(): void {
    this.dungeonSession.clear();
    this.api.start({ battleType: 'PVE', formationCode: 'DEFAULT' }).subscribe({
      next: response => {
        this.loading = false;
        if (!response.success || !response.data) {
          this.error = response.message;
          return;
        }
        this.battle = response.data;
        this.engine.resetBattle();
        this.engine.loadServerBattle(response.data);
        this.engine.startBattle();
      },
      error: error => {
        this.loading = false;
        this.error = error?.message ?? 'Không thể tạo trận demo.';
      }
    });
  }
}
