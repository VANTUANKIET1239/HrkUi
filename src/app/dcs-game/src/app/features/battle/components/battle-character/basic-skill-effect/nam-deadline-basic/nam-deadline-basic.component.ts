import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nam-deadline-basic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nam-deadline-basic.component.html',
  styleUrl: './nam-deadline-basic.component.scss'
})
export class NamDeadlineBasicComponent {
  @Input() phase: 'cast' | 'impact' = 'cast';
  @Input() isTeamRight = false;
}
