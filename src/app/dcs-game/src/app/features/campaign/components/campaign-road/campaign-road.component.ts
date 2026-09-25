import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DungeonStage } from '../../../../core/models/dungeon.model';
import { STAGE_COORDINATES, ROAD_VIEWBOX, buildSmoothSvgPath, RoadPoint } from './campaign-road.models';

@Component({
  selector: 'app-campaign-road',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-road.component.html',
  styleUrl: './campaign-road.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignRoadComponent implements OnChanges {
  @Input() stages: DungeonStage[] = [];
  @Input() currentStageNumber = 1;

  readonly viewBox = `0 0 ${ROAD_VIEWBOX.width} ${ROAD_VIEWBOX.height}`;
  readonly roadPoints: RoadPoint[] = STAGE_COORDINATES;

  fullPathD = '';
  unlockedPathD = '';
  unlockedPercent = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.recalculatePaths();
  }

  private recalculatePaths(): void {
    // 1. Build full path
    this.fullPathD = buildSmoothSvgPath(this.roadPoints);

    // 2. Find max unlocked stage index (stageNumber is 1-indexed)
    let maxUnlocked = 1;
    if (this.stages && this.stages.length > 0) {
      for (const s of this.stages) {
        if (s.state === 'CLEARED' || s.state === 'AVAILABLE') {
          if (s.stageNumber > maxUnlocked) {
            maxUnlocked = s.stageNumber;
          }
        }
      }
    } else {
      maxUnlocked = Math.max(1, this.currentStageNumber);
    }

    // Points up to maxUnlocked
    const unlockedPoints = this.roadPoints.slice(0, Math.min(this.roadPoints.length, maxUnlocked));
    this.unlockedPathD = buildSmoothSvgPath(unlockedPoints);
    this.unlockedPercent = Math.min(100, Math.round((maxUnlocked / this.roadPoints.length) * 100));
  }
}
