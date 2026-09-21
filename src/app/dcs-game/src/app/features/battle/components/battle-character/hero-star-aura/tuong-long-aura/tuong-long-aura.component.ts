import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tuong-long-aura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tuong-long-aura.component.html',
  styleUrl: './tuong-long-aura.component.scss'
})
export class TuongLongAuraComponent {
  @Input() starLevel = 0;
  @Input() intensity = 1;
  @Input() particleLevel = 1;
  @Input() primaryColor?: string | null = '#f97316';
  @Input() secondaryColor?: string | null = '#eab308';
}
