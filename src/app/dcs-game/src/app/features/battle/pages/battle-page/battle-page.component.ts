import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BattleEngineService } from '../../../../core/services/battle-engine.service';
import { DungeonSessionService } from '../../../../core/services/dungeon-session.service';
import { BattleSceneComponent } from '../../components/battle-scene/battle-scene.component';

@Component({
  selector: 'app-battle-page',
  standalone: true,
  imports: [CommonModule, BattleSceneComponent],
  templateUrl: './battle-page.component.html',
  styleUrl: './battle-page.component.scss',
})
export class BattlePageComponent implements OnInit {
  private readonly battleEngine = inject(BattleEngineService);
  readonly session = inject(DungeonSessionService);
  private readonly router = inject(Router);
  isLoading = true;
  loadError = '';
  ngOnInit(): void {
    const run = this.session.current();
    if (!run) {
      const mapId = this.session.currentMapId();
      this.router.navigate(
        mapId ? ['/dcs-game/campaign/maps', mapId] : ['/dcs-game/campaign'],
      );
      return;
    }
    this.battleEngine.resetBattle();
    this.battleEngine.loadServerBattle(run.battle);
    this.isLoading = false;
    this.battleEngine.startBattle();
  }
}
export default BattlePageComponent;
