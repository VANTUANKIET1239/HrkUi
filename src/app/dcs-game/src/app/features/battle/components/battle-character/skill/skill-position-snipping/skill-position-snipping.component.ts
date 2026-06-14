import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-position-snipping',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-position-snipping.component.html',
  styleUrl: './skill-position-snipping.component.scss'
})
export class SkillPositionSnippingComponent {
  @Input() isTeamRight = false;
}
