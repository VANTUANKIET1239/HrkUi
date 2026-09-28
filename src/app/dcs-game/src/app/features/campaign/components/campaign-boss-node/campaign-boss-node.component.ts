import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DungeonStage } from '../../../../core/models/dungeon.model';

@Component({
  selector: 'app-campaign-boss-node',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-boss-node.component.html',
  styleUrl: './campaign-boss-node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignBossNodeComponent {
  @Input({ required: true }) stage!: DungeonStage;
  @Input() xPercent = 50;
  @Input() yPercent = 50;
  @Output() selectStage = new EventEmitter<DungeonStage>();

  get isClickable(): boolean {
    return this.stage.state !== 'LOCKED';
  }

  get bossTier(): 'MINI_BOSS' | 'BOSS' | 'GRAND_BOSS' {
    if (this.stage.stageNumber === 15 || this.stage.stageType === 'BOSS') {
      return 'GRAND_BOSS';
    }
    if (this.stage.stageNumber === 10) {
      return 'BOSS';
    }
    return 'MINI_BOSS';
  }

  get bossTierLabel(): string {
    switch (this.bossTier) {
      case 'GRAND_BOSS': return 'ĐẠI BOSS';
      case 'BOSS': return 'BOSS';
      case 'MINI_BOSS': return 'MINI BOSS';
    }
  }

  get bossImage(): string {
    const bossEnemy = this.stage.enemies?.find(e => e.isBoss);
    if (bossEnemy?.imagePath) return bossEnemy.imagePath;
    if (this.stage.enemies?.[2]?.imagePath) return this.stage.enemies[2].imagePath;
    if (this.stage.enemies?.[0]?.imagePath) return this.stage.enemies[0].imagePath;
    return '/assets/images/dcs-game/dungeon/monsters/monster-5.png';
  }

  get bossName(): string {
    const bossEnemy = this.stage.enemies?.find(e => e.isBoss);
    return bossEnemy?.name || this.stage.name;
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('monster-5.png')) {
      target.src = '/assets/images/dcs-game/dungeon/monsters/monster-5.png';
    }
  }

  onBossClick(): void {
    if (this.isClickable) {
      this.selectStage.emit(this.stage);
    }
  }
}
