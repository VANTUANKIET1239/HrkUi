import { HrkImageDirective } from '../../../../../../../../../../libs/shared/ui/controls/hrk-image/hrk-image.directive';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-winter-blessings',
  standalone: true,
  imports: [HrkImageDirective, CommonModule],
  templateUrl: './skill-winter-blessings.component.html',
  styleUrl: './skill-winter-blessings.component.scss'
})
export class SkillWinterBlessingsComponent {
  @Input() isTeamRight = false;
}
