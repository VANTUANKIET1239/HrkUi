import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qa-ky-tinh-basic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qa-ky-tinh-basic.component.html',
  styleUrl: './qa-ky-tinh-basic.component.scss'
})
export class QaKyTinhBasicComponent {
  @Input() phase: 'cast' | 'impact' = 'cast';
  @Input() isTeamRight = false;
}
