import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tester-dep-aura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tester-dep-aura.component.html',
  styleUrl: './tester-dep-aura.component.scss'
})
export class TesterDepAuraComponent {
  @Input() starLevel = 0;
  @Input() intensity = 1;
  @Input() particleLevel = 1;
  @Input() primaryColor?: string | null = '#a855f7';
  @Input() secondaryColor?: string | null = '#1e1b4b';
}
