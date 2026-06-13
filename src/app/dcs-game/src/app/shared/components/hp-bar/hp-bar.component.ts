import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hp-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hp-bar.component.html',
  styleUrl: './hp-bar.component.scss'
})
export class HpBarComponent implements OnChanges {
  @Input() hp = 0;
  @Input() maxHp = 100;

  percentage = 100;
  catchUpPercentage = 100;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hp'] || changes['maxHp']) {
      const safeHp = Math.max(0, Math.min(this.hp, this.maxHp));
      this.percentage = this.maxHp > 0 ? (safeHp / this.maxHp) * 100 : 0;
      
      // Delay the catch up bar slightly if health decreased
      if (changes['hp'] && !changes['hp'].firstChange) {
        const prev = changes['hp'].previousValue;
        const curr = changes['hp'].currentValue;
        if (curr < prev) {
          // Keep catchup where it was, then let it slide down
          setTimeout(() => {
            this.catchUpPercentage = this.percentage;
          }, 400);
        } else {
          this.catchUpPercentage = this.percentage;
        }
      } else {
        this.catchUpPercentage = this.percentage;
      }
    }
  }

  getHpColorClass(): string {
    if (this.percentage > 50) return 'hp-green';
    if (this.percentage > 20) return 'hp-warning';
    return 'hp-danger';
  }
}
