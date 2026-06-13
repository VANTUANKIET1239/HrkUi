import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-ricardo-milos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-ricardo-milos.component.html',
  styleUrl: './skill-ricardo-milos.component.scss'
})
export class SkillRicardoMilosComponent {
  @Input() isTeamRight = false;
}
