import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-all-in',
  standalone: true,
  imports: [HrkTranslatePipe, CommonModule],
  templateUrl: './skill-all-in.component.html',
  styleUrl: './skill-all-in.component.scss'
})
export class SkillAllInComponent {
  @Input() isTeamRight = false;
}
