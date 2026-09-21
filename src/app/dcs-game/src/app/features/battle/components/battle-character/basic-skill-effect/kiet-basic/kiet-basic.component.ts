import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kiet-basic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kiet-basic.component.html',
  styleUrl: './kiet-basic.component.scss'
})
export class KietBasicComponent {
  @Input() phase: 'cast' | 'impact' = 'cast';
  @Input() isTeamRight = false;
}
