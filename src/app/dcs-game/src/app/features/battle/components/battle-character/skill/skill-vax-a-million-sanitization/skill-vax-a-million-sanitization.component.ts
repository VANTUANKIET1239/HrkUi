import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-vax-a-million-sanitization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-vax-a-million-sanitization.component.html',
  styleUrl: './skill-vax-a-million-sanitization.component.scss'
})
export class SkillVaxAMillionSanitizationComponent {
  @Input() isTeamRight = false;
}
