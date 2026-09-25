import { Component, Input, ViewEncapsulation, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BattleEngineService } from '../../../../core/services/battle-engine.service';
import { DungeonSessionService } from '../../../../core/services/dungeon-session.service';
import { StartBattleResultDto } from '../../../../core/models/battle.model';
import { BattleCharacterComponent } from '../battle-character/battle-character.component';
import { BattleResultModalComponent } from '../battle-result-modal/battle-result-modal.component';
import { BattleLogPanelComponent } from '../battle-log-panel/battle-log-panel.component';
import { BattleSkillVfxHostComponent } from '../../skill-vfx/battle-skill-vfx-host.component';
import { BATTLE_SKILL_VFX_REGISTRY } from '../../skill-vfx/battle-skill-vfx.registry';
import { BattleHeaderComponent } from '../battle-header/battle-header.component';
import { BattleControlsComponent } from '../battle-controls/battle-controls.component';
import { BattleNotificationComponent } from '../battle-notification/battle-notification.component';
import { BattleSkipConfirmModalComponent } from '../battle-skip-confirm-modal/battle-skip-confirm-modal.component';
import { EquipmentTooltipComponent } from '../../../../shared/components/equipment-tooltip/equipment-tooltip.component';

@Component({
  selector: 'app-battle-scene',
  standalone: true,
  imports: [
    CommonModule,
    BattleCharacterComponent,
    BattleResultModalComponent,
    BattleLogPanelComponent,
    BattleSkillVfxHostComponent,
    BattleHeaderComponent,
    BattleControlsComponent,
    BattleNotificationComponent,
    BattleSkipConfirmModalComponent,
    EquipmentTooltipComponent
  ],
  templateUrl: './battle-scene.component.html',
  styleUrl: './battle-scene.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class BattleSceneComponent {
  @Input() replayBattle?: StartBattleResultDto | null;
  @Input() demoMode = false;

  readonly battleEngine = inject(BattleEngineService);
  readonly dungeonSession = inject(DungeonSessionService);
  private readonly router = inject(Router);

  readonly isSkipModalOpen = signal(false);
  readonly isLogOpen = signal(false);

  replay(): void {
    const battle = this.replayBattle ?? this.dungeonSession.current()?.battle;
    if (!battle) return;
    this.battleEngine.resetBattle();
    this.battleEngine.loadServerBattle(battle);
    this.battleEngine.startBattle();
  }

  exitBattle(): void {
    if (this.demoMode) {
      this.router.navigate(['/dcs-game/home']);
      return;
    }
    const mapId = this.dungeonSession.currentMapId();
    this.dungeonSession.clear();
    this.router.navigate(mapId ? ['/dcs-game/campaign/maps', mapId] : ['/dcs-game/campaign']);
  }

  togglePlay(): void {
    if (this.battleEngine.status() === 'playing') {
      this.battleEngine.pauseBattle();
    } else {
      this.battleEngine.startBattle();
    }
  }

  onSpeedChange(speed: number): void {
    this.battleEngine.setSpeed(speed);
  }

  openSkipModal(): void {
    if (this.battleEngine.status() !== 'finished') {
      this.isSkipModalOpen.set(true);
    }
  }

  closeSkipModal(): void {
    this.isSkipModalOpen.set(false);
  }

  confirmSkip(): void {
    this.isSkipModalOpen.set(false);
    this.battleEngine.skipToEnd();
  }

  toggleLog(): void {
    this.isLogOpen.update(v => !v);
  }

  getLeftTeam() {
    return this.battleEngine.heroes().filter(h => h.team === 'left');
  }

  getRightTeam() {
    return this.battleEngine.heroes().filter(h => h.team === 'right');
  }

  getActorName(): string {
    const actorId = this.battleEngine.visualActorId() ?? this.battleEngine.activeActorId();
    if (actorId === null) return '';
    const actor = this.battleEngine.heroes().find(h => h.id === actorId);
    return actor ? actor.name : '';
  }

  isPlayerVictory(): boolean {
    const leftAlive = this.battleEngine.heroes().some(h => h.team === 'left' && h.hp > 0);
    return leftAlive;
  }

  getAliveCount(team: 'left' | 'right'): number {
    return this.battleEngine.heroes().filter(h => h.team === team && h.hp > 0).length;
  }

  getTotalHp(team: 'left' | 'right'): number {
    return this.battleEngine.heroes()
      .filter(h => h.team === team)
      .reduce((sum, h) => sum + h.hp, 0);
  }

  getPowerScore(): number {
    return this.getLeftTeam().reduce((total, hero) => total + (hero.power ?? 0), 0);
  }

  getLeaderAvatar(): string | undefined {
    const leftTeam = this.getLeftTeam();
    return leftTeam.length > 0 ? leftTeam[0].avatar : undefined;
  }

  isScreenShaking(): boolean {
    const skillId = this.battleEngine.currentVisualSkillId();
    const events = this.battleEngine.damageEvents();
    const hasAnyDamage = Object.values(events).some(ev => ev !== null);
    return !!skillId && !!BATTLE_SKILL_VFX_REGISTRY[skillId]?.screenShake && hasAnyDamage;
  }
}
