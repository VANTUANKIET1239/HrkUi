import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-all-in',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-all-in.component.html',
  styleUrl: './skill-all-in.component.scss'
})
export class SkillAllInComponent {
  @Input() isTeamRight = false;
}
