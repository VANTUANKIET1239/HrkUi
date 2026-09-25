import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hai-last-smile-aura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hai-last-smile-aura.component.html',
  styleUrl: './hai-last-smile-aura.component.scss'
})
export class HaiLastSmileAuraComponent {
  @Input() starLevel = 0;
  @Input() intensity = 1;
  @Input() particleLevel = 1;
  @Input() primaryColor?: string | null = '#06b6d4';
  @Input() secondaryColor?: string | null = '#ef4444';
}
