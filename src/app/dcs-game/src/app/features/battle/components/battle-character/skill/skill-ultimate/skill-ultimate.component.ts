import { HrkImageDirective } from '../../../../../../../../../../libs/shared/ui/controls/hrk-image/hrk-image.directive';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-ultimate',
  standalone: true,
  imports: [HrkImageDirective, CommonModule],
  templateUrl: './skill-ultimate.component.html',
  styleUrl: './skill-ultimate.component.scss'
})
export class SkillUltimateComponent {
  @Input() characterAvatar = '';
  @Input() isTeamRight = false;
}
