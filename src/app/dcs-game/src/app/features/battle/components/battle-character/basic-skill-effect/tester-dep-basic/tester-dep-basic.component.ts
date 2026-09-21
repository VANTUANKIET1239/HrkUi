import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tester-dep-basic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tester-dep-basic.component.html',
  styleUrl: './tester-dep-basic.component.scss'
})
export class TesterDepBasicComponent {
  @Input() phase: 'cast' | 'impact' = 'cast';
  @Input() isTeamRight = false;
}
