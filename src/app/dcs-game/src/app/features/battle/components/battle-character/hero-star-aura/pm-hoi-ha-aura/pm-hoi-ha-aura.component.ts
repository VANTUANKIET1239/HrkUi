import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pm-hoi-ha-aura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pm-hoi-ha-aura.component.html',
  styleUrl: './pm-hoi-ha-aura.component.scss'
})
export class PmHoiHaAuraComponent {
  @Input() starLevel = 0;
  @Input() intensity = 1;
  @Input() particleLevel = 1;
  @Input() primaryColor?: string | null = '#14b8a6';
  @Input() secondaryColor?: string | null = '#8b5cf6';
}
