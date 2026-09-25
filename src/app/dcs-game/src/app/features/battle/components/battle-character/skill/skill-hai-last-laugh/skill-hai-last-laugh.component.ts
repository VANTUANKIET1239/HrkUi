import { Component, Input, OnInit, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../../../core/models/hero.model';

@Component({
  selector: 'app-skill-hai-last-laugh',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-hai-last-laugh.component.html',
  styleUrl: './skill-hai-last-laugh.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillHaiLastLaughComponent implements OnInit {
  @Input() isTeamRight = false;
  @Input() character?: Hero | null;

  targetOffsetX = 260;
  targetOffsetY = 0;
  activePhase: 'all' = 'all';

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.calculateTargetVector();
  }

  get facingDirection(): number {
    return this.isTeamRight ? -1 : 1;
  }

  private calculateTargetVector(): void {
    try {
      const hostEl = this.elementRef.nativeElement;
      const casterRect = hostEl.getBoundingClientRect();
      const opponentSelector = this.isTeamRight
        ? '.character-sprite-wrapper.team-left:not(.is-dead)'
        : '.character-sprite-wrapper.team-right:not(.is-dead)';

      const opponents = Array.from(document.querySelectorAll<HTMLElement>(opponentSelector));
      if (opponents.length > 0) {
        // Target closest or first alive opponent
        const targetRect = opponents[0].getBoundingClientRect();
        const dx = (targetRect.left + targetRect.width / 2) - (casterRect.left + casterRect.width / 2);
        const dy = (targetRect.top + targetRect.height / 2) - (casterRect.top + casterRect.height / 2);

        // Assign relative offset along facing direction
        const absX = Math.abs(dx);
        if (absX > 60 && absX < 800) {
          this.targetOffsetX = absX;
          this.targetOffsetY = dy;
          hostEl.style.setProperty('--dynamic-target-x', `${absX}px`);
          hostEl.style.setProperty('--dynamic-target-y', `${dy}px`);
        }
      }
    } catch {
      // Fallback uses default 260px offset
    }
  }
}
