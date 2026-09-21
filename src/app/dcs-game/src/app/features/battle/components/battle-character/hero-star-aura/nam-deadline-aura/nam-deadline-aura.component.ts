import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nam-deadline-aura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nam-deadline-aura.component.html',
  styleUrl: './nam-deadline-aura.component.scss'
})
export class NamDeadlineAuraComponent {
  @Input() starLevel = 0;
  @Input() intensity = 1;
  @Input() particleLevel = 1;
  @Input() primaryColor?: string | null = '#06b6d4';
  @Input() secondaryColor?: string | null = '#e0f2fe';
}
