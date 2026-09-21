import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chuan-men-aura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chuan-men-aura.component.html',
  styleUrl: './chuan-men-aura.component.scss'
})
export class ChuanMenAuraComponent {
  @Input() starLevel = 0;
  @Input() intensity = 1;
  @Input() particleLevel = 1;
  @Input() primaryColor?: string | null = '#dc2626';
  @Input() secondaryColor?: string | null = '#9333ea';
}
