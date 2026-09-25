import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DungeonStage } from '../../../../core/models/dungeon.model';

@Component({
  selector: 'app-campaign-stage-node',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-stage-node.component.html',
  styleUrl: './campaign-stage-node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignStageNodeComponent {
  @Input({ required: true }) stage!: DungeonStage;
  @Input() xPercent = 50;
  @Input() yPercent = 50;
  @Output() selectStage = new EventEmitter<DungeonStage>();

  get isClickable(): boolean {
    return this.stage.state !== 'LOCKED';
  }

  onNodeClick(): void {
    if (this.isClickable) {
      this.selectStage.emit(this.stage);
    }
  }
}
