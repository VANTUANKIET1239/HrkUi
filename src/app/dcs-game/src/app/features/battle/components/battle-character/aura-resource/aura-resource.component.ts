import { Component, Input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../../core/models/hero.model';
import { resolveAuraResourceKey } from './aura-resource.resolver';
import { ThanhThaiAuraComponent } from './thanh-thai-aura/thanh-thai-aura.component';
import { SibaAngelBlessingComponent } from './siba-angel-blessing/siba-angel-blessing.component';

@Component({
  selector: 'app-aura-resource',
  standalone: true,
  imports: [CommonModule, ThanhThaiAuraComponent, SibaAngelBlessingComponent],
  template: `
    <ng-container *ngIf="resolvedAuraKey === 'thanh-thai-aura' && auraResource as aura">
      <app-thanh-thai-aura-resource
        [currentAura]="aura.currentValue"
        [maxAura]="aura.maxValue"
        [auraTier]="aura.tier ?? 0"
        [isFullAura]="aura.isFull ?? false"
        [visualSpeed]="visualSpeed"
        [team]="character.team"
        [facing]="character.defaultFacing || (character.team === 'left' ? 'right' : 'left')">
      </app-thanh-thai-aura-resource>
    </ng-container>

    <ng-container *ngIf="resolvedAuraKey === 'siba-angel-blessing' && blessingResource as blessing">
      <app-siba-angel-blessing-resource
        [currentBlessing]="blessing.currentValue"
        [maxBlessing]="blessing.maxValue || 5"
        [isFullBlessing]="blessing.isFull ?? (blessing.currentValue >= 5)"
        [visualSpeed]="visualSpeed"
        [team]="character.team">
      </app-siba-angel-blessing-resource>
    </ng-container>
  `,
  styles: [`
    :host {
      display: contents;
      pointer-events: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuraResourceComponent {
  @Input({ required: true }) character!: Hero;
  @Input() visualSpeed = 1;

  get resolvedAuraKey(): string | null {
    return resolveAuraResourceKey(this.character.heroCode, this.character.avatar);
  }

  get auraResource() {
    return this.character.resources?.['AURA'] ?? (
      this.resolvedAuraKey === 'thanh-thai-aura'
        ? {
            resourceCode: 'AURA',
            currentValue: this.character.auraTier ? this.character.auraTier * 25 : 0,
            maxValue: 100,
            tier: this.character.auraTier ?? 0,
            isFull: (this.character.auraTier ?? 0) >= 4
          }
        : null
    );
  }

  get blessingResource() {
    return this.character.resources?.['ANGEL_BLESSING'] ?? (
      this.resolvedAuraKey === 'siba-angel-blessing'
        ? {
            resourceCode: 'ANGEL_BLESSING',
            currentValue: 0,
            maxValue: 5,
            tier: 0,
            isFull: false
          }
        : null
    );
  }
}
