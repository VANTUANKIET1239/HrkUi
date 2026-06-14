import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-tactical-air-strike',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-tactical-air-strike.component.html',
  styleUrl: './skill-tactical-air-strike.component.scss'
})
export class SkillTacticalAirStrikeComponent {
  @Input() isTeamRight = false;
}
