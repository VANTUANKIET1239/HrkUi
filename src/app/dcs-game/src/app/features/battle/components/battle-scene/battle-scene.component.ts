import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleEngineService } from '../../../../core/services/battle-engine.service';
import { BattleCharacterComponent } from '../battle-character/battle-character.component';
import { BattleResultModalComponent } from '../battle-result-modal/battle-result-modal.component';
import { SKILL_LIST } from '../../mocks/mock-battle.data';

@Component({
  selector: 'app-battle-scene',
  standalone: true,
  imports: [
    CommonModule,
    BattleCharacterComponent,
    BattleResultModalComponent
  ],
  templateUrl: './battle-scene.component.html',
  styleUrl: './battle-scene.component.scss'
})
export class BattleSceneComponent {
  readonly battleEngine = inject(BattleEngineService);

  getLeftTeam() {
    return this.battleEngine.heroes().filter(h => h.team === 'left');
  }

  getRightTeam() {
    return this.battleEngine.heroes().filter(h => h.team === 'right');
  }

  getActorName(): string {
    const actorId = this.battleEngine.activeActorId();
    if (actorId === null) return '';
    const actor = this.battleEngine.heroes().find(h => h.id === actorId);
    return actor ? actor.name : '';
  }

  isPlayerVictory(): boolean {
    // Left team is the player team
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

  getLeaderAvatar(): string {
    const leftTeam = this.getLeftTeam();
    return leftTeam.length > 0 ? leftTeam[0].avatar : 'https://api.dicebear.com/7.x/adventurer/svg?seed=leader';
  }

  getActiveActorSkills() {
    const actor = this.battleEngine.activeActor();
    if (!actor || !actor.skills) {
      return [
        { name: 'Đánh Thường', cost: '0 MP', color: '#aaaaaa' },
        { name: 'Kỹ Năng 1', cost: '25 MP', color: '#4b5563' },
        { name: 'Tuyệt Kỹ', cost: '70 MP', color: '#4b5563' }
      ];
    }
    return actor.skills.map(id => {
      const skill = SKILL_LIST[id];
      if (skill) {
        return {
          name: skill.name,
          cost: `${skill.cost} ${skill.costType}`,
          color: skill.color
        };
      }
      return { name: 'Đánh Thường', cost: '0 MP', color: '#aaaaaa' };
    });
  }

  isScreenShaking(): boolean {
    const skillId = this.battleEngine.currentSkillId();
    const isUlt = skillId !== null && [
      'ULTIMATE_SIXPACK', 'SWORD_DANCE', 'DEPLOY_PROD', 'CLOSE_JIRA', 
      'HEAVENLY_JUDGMENT', 'RICARDO_MILOS', 'RANDOM_KNOWLEDGE_DROP',
      'DARK_KNOWLEDGE_SHIELD_CONVERSION', 'TACTICAL_AIR_STRIKE'
    ].includes(skillId);

    const events = this.battleEngine.damageEvents();
    const hasAnyDamage = Object.values(events).some(ev => ev !== null);

    return isUlt && hasAnyDamage;
  }
}
