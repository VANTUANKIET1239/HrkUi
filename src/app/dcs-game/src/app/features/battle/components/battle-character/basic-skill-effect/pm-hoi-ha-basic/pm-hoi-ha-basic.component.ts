import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pm-hoi-ha-basic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pm-hoi-ha-basic.component.html',
  styleUrl: './pm-hoi-ha-basic.component.scss'
})
export class PmHoiHaBasicComponent {
  @Input() phase: 'cast' | 'impact' = 'cast';
  @Input() isTeamRight = false;
}
