import { CommonModule, NgComponentOutlet } from '@angular/common';
import { Component, Input, Type } from '@angular/core';
import { BATTLE_SKILL_VFX_REGISTRY } from './battle-skill-vfx.registry';

@Component({
  selector: 'app-battle-skill-vfx-host',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="component; inputs: componentInputs"></ng-container>'
})
export class BattleSkillVfxHostComponent {
  @Input() skillId: string | null = null;
  @Input() actorActive = false;
  @Input() impactActive = false;
  @Input() actorTeamRight = false;
  @Input() isEmpowered = false;
  @Input() visualSpeed = 1;

  get component(): Type<unknown> | null {
    return this.skillId ? BATTLE_SKILL_VFX_REGISTRY[this.skillId]?.sceneComponent ?? null : null;
  }

  get componentInputs(): Record<string, unknown> {
    if (this.skillId === 'HEAVENLY_JUDGMENT') return { active: this.impactActive };
    if (this.skillId === 'DARK_KNOWLEDGE_SHIELD_CONVERSION')
      return { actorActive: this.actorActive, impactActive: this.impactActive };
    if (this.skillId === 'DEADLIFT_DIA_CHAN') return { actorTeamRight: this.actorTeamRight };
    if (this.skillId === 'RICARDO_MILOS') return {
      actorTeamRight: this.actorTeamRight,
      empowered: this.isEmpowered,
      visualSpeed: this.visualSpeed
    };
    return {};
  }
}
