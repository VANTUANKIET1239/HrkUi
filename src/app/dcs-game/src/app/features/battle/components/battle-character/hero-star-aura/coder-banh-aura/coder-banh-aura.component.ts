import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coder-banh-aura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coder-banh-aura.component.html',
  styleUrl: './coder-banh-aura.component.scss'
})
export class CoderBanhAuraComponent {
  @Input() starLevel = 0;
  @Input() intensity = 1;
  @Input() particleLevel = 1;
  @Input() primaryColor?: string | null = '#10b981';
  @Input() secondaryColor?: string | null = '#06b6d4';
}
