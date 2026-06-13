import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-ultimate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-ultimate.component.html',
  styleUrl: './skill-ultimate.component.scss'
})
export class SkillUltimateComponent {
  @Input() characterAvatar = '';
  @Input() isTeamRight = false;
}
