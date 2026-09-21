import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qa-ky-tinh-aura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qa-ky-tinh-aura.component.html',
  styleUrl: './qa-ky-tinh-aura.component.scss'
})
export class QaKyTinhAuraComponent {
  @Input() starLevel = 0;
  @Input() intensity = 1;
  @Input() particleLevel = 1;
  @Input() primaryColor?: string | null = '#ef4444';
  @Input() secondaryColor?: string | null = '#eab308';
}
