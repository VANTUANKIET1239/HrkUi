import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mana-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mana-bar.component.html',
  styleUrl: './mana-bar.component.scss'
})
export class ManaBarComponent implements OnChanges {
  @Input() mana = 0;
  @Input() maxMana = 100;

  percentage = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mana'] || changes['maxMana']) {
      const safeMana = Math.max(0, Math.min(this.mana, this.maxMana));
      this.percentage = this.maxMana > 0 ? (safeMana / this.maxMana) * 100 : 0;
    }
  }
}
