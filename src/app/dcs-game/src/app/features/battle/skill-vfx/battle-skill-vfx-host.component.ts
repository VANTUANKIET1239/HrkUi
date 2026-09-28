import { CommonModule, NgComponentOutlet } from '@angular/common';
import { Component, Input, Type } from '@angular/core';
import { BattleEventDto } from '../../../core/models/battle.model';
import { BATTLE_SKILL_VFX_REGISTRY } from './battle-skill-vfx.registry';

@Component({
  selector: 'app-battle-skill-vfx-host',
  standalone: true,
  imports: [CommonModule, NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="component; inputs: componentInputs"></ng-container>',
  styles: [`
    :host {
      display: block;
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 30;
    }
  `]
})
export class BattleSkillVfxHostComponent {
  @Input() skillId: string | null = null;
  @Input() actorActive = false;
  @Input() impactActive = false;
  @Input() actorTeamRight = false;
  @Input() isEmpowered = false;
  @Input() visualSpeed = 1;
  @Input() targetCount = 0;
  @Input() castSequence?: number | null = null;
  @Input() actorId?: number | null = null;
  @Input() activeTargetIds: number[] = [];
  @Input() castEvents: BattleEventDto[] = [];

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
    if (
      this.skillId === 'THANH_THAI_CRIMSON_BROOM_LIGHTNING' ||
      this.skillId === 'HAI_LAST_LAUGH' ||
      this.skillId === 'PRIME_FORTRESS_CHARGE' ||
      this.skillId === 'TRONG_CHUA_NO_THREE_SECONDS' ||
      this.skillId === 'QUANG_VINH_THCS_HONOR_BARRIER' ||
      this.skillId === 'NGUYEN_XAM_LON_BOSS_ENTERS' ||
      this.skillId === 'TIEN_DUNG_XUAN_TEN_THOUSAND_GLYPHS' ||
      this.skillId === 'VAN_TRONG_DIEN_VANG_CHAIN_LIGHTNING' ||
      this.skillId === 'TUONG_LONG_CAP_3_CLASS_BELL' ||
      this.skillId === 'KIET_BAC_SI_EMERGENCY_PROTOCOL' ||
      this.skillId === 'TRUONG_KIET_SOUL_KISS' ||
      this.skillId === 'TIEN_DUNG_EMERGENCY_CONFERENCE' ||
      this.skillId === 'QUOC_NHAN_NIGHT_PHANTOMS' ||
      this.skillId === 'CAU_VANG_CALM_GUARD' ||
      this.skillId === 'SIBA_CELESTIAL_PROTECTION' ||
      this.skillId === 'SIBA_ANGEL_GENTLE_WING'
    ) {
      return {
        skillId: this.skillId,
        actorActive: this.actorActive,
        impactActive: this.impactActive,
        actorTeamRight: this.actorTeamRight,
        visualSpeed: this.visualSpeed,
        isEmpowered: this.isEmpowered,
        empowered: this.isEmpowered,
        targetCount: this.targetCount,
        castSequence: this.castSequence,
        actorId: this.actorId,
        activeTargetIds: this.activeTargetIds,
        castEvents: this.castEvents
      };
    }
    return {};
  }
}
