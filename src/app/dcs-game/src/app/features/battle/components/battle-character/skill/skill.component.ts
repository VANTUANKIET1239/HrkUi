import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../../core/models/hero.model';
import { SkillBasicComponent } from './skill-basic/skill-basic.component';
import { SkillRageComponent } from './skill-rage/skill-rage.component';
import { SkillThunderComponent } from './skill-thunder/skill-thunder.component';
import { SkillUltimateComponent } from './skill-ultimate/skill-ultimate.component';
import { SkillHeavenlyComponent } from './skill-heavenly/skill-heavenly.component';
import { SkillVaxAMillionSanitizationComponent } from './skill-vax-a-million-sanitization/skill-vax-a-million-sanitization.component';
import { SkillRicardoMilosComponent } from './skill-ricardo-milos/skill-ricardo-milos.component';
import { SkillRandomKnowledgeDropComponent } from './skill-random-knowledge-drop/skill-random-knowledge-drop.component';
import { SkillDarkKnowledgeComponent } from './skill-dark-knowledge/skill-dark-knowledge.component';
import { SkillTacticalAirStrikeComponent } from './skill-tactical-air-strike/skill-tactical-air-strike.component';
import { SkillPositionSnippingComponent } from './skill-position-snipping/skill-position-snipping.component';
import { SkillAllInComponent } from './skill-all-in/skill-all-in.component';
import { SkillWinterBlessingsComponent } from './skill-winter-blessings/skill-winter-blessings.component';
import { SkillDeadliftDiaChanComponent } from './skill-deadlift-dia-chan/skill-deadlift-dia-chan.component';

@Component({
  selector: 'app-skill',
  standalone: true,
  imports: [
    CommonModule,
    SkillBasicComponent,
    SkillRageComponent,
    SkillThunderComponent,
    SkillUltimateComponent,
    SkillHeavenlyComponent,
    SkillVaxAMillionSanitizationComponent,
    SkillRicardoMilosComponent,
    SkillRandomKnowledgeDropComponent,
    SkillDarkKnowledgeComponent,
    SkillTacticalAirStrikeComponent,
    SkillPositionSnippingComponent,
    SkillAllInComponent,
    SkillWinterBlessingsComponent,
    SkillDeadliftDiaChanComponent
  ],
  templateUrl: './skill.component.html',
  styleUrl: './skill.component.scss'
})
export class SkillComponent {
  @Input() isCharging = false;
  @Input() skillCategory: 'basic' | 'rage' | 'thunder' | 'ultimate' | 'heavenly' | null = null;
  @Input() skillColor = '#ffffff';
  @Input() activeSkillId: string | null = null;
  @Input({ required: true }) character!: Hero;

  get isTeamRight(): boolean {
    return this.character.team === 'right';
  }
}
