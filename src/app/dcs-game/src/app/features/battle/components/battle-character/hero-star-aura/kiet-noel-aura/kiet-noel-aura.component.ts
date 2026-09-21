import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kiet-noel-aura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kiet-noel-aura.component.html',
  styleUrl: './kiet-noel-aura.component.scss'
})
export class KietNoelAuraComponent {
  @Input() starLevel = 0;
  @Input() intensity = 1;
  @Input() particleLevel = 1;
  @Input() primaryColor?: string | null = '#38bdf8';
  @Input() secondaryColor?: string | null = '#7c3aed';
}
