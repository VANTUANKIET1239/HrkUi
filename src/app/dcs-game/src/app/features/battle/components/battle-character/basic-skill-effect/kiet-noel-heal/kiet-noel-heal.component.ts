import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kiet-noel-heal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kiet-noel-heal.component.html',
  styleUrl: './kiet-noel-heal.component.scss'
})
export class KietNoelHealComponent {
  @Input() phase: 'cast' | 'impact' = 'cast';
  @Input() isTeamRight = false;
}
