import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hoang-nguyen-aura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hoang-nguyen-aura.component.html',
  styleUrl: './hoang-nguyen-aura.component.scss'
})
export class HoangNguyenAuraComponent {
  @Input() starLevel = 0;
  @Input() intensity = 1;
  @Input() particleLevel = 1;
  @Input() primaryColor?: string | null = '#eab308';
  @Input() secondaryColor?: string | null = '#64748b';
}
