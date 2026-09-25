import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hai-last-smile-basic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hai-last-smile-basic.component.html',
  styleUrl: './hai-last-smile-basic.component.scss'
})
export class HaiLastSmileBasicComponent {
  @Input() phase: 'cast' | 'impact' = 'cast';
  @Input() isTeamRight = false;
}
