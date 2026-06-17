import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-deadlift-dia-chan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-deadlift-dia-chan.component.html',
  styleUrl: './skill-deadlift-dia-chan.component.scss'
})
export class SkillDeadliftDiaChanComponent {
  @Input() isTeamRight = false;
}
