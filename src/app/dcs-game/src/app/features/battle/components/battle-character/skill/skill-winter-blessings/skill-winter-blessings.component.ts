import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-winter-blessings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-winter-blessings.component.html',
  styleUrl: './skill-winter-blessings.component.scss'
})
export class SkillWinterBlessingsComponent {
  @Input() isTeamRight = false;
}
