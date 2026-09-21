import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kiet-aura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kiet-aura.component.html',
  styleUrl: './kiet-aura.component.scss'
})
export class KietAuraComponent {
  @Input() starLevel = 0;
  @Input() intensity = 1;
  @Input() particleLevel = 1;
  @Input() primaryColor?: string | null = '#e11d48';
  @Input() secondaryColor?: string | null = '#f59e0b';
}
