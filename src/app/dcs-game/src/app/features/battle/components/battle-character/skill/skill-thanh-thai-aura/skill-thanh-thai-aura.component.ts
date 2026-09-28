import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../../../core/models/hero.model';

@Component({
  selector: 'app-skill-thanh-thai-aura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-thanh-thai-aura.component.html',
  styleUrl: './skill-thanh-thai-aura.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillThanhThaiAuraComponent {
  @Input() isTeamRight = false;
  @Input() phase: string = 'idle';
  @Input() visualSpeed = 1;
  @Input() castSequence?: number | null = null;
  @Input() activeSkillId: string | null = null;
  @Input() character!: Hero;

  get isBasic(): boolean {
    return this.activeSkillId === 'THANH_THAI_DISRESPECTFUL_SWEEP';
  }

  get isUltimate(): boolean {
    return this.activeSkillId === 'THANH_THAI_CRIMSON_BROOM_LIGHTNING';
  }

  get isCastPhase(): boolean {
    return this.phase === 'cast' || this.phase === 'PREPARE' || this.phase === 'AURA_CHECK';
  }

  get isImpactPhase(): boolean {
    return this.phase === 'impact' || this.phase === 'IMPACT' || this.phase === 'PRIMARY_IMPACT' ||
           this.phase === 'SWEEP' || this.phase === 'BROOM_THROW' || this.phase?.startsWith('CHAIN');
  }

  get isRecoveryPhase(): boolean {
    return this.phase === 'recovery' || this.phase === 'RECOVERY' || this.phase === 'RETURN' || this.phase === 'BROOM_RETURN';
  }
}
