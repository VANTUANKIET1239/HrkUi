import { HrkTranslatePipe } from '@hrk/localization/hrk-translate.pipe';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-battle-notification',
  standalone: true,
  imports: [HrkTranslatePipe, CommonModule],
  templateUrl: './battle-notification.component.html',
  styleUrl: './battle-notification.component.scss'
})
export class BattleNotificationComponent {
  @Input() skillName: string | null = null;
  @Input() skillColor = '#fbbf24';
  @Input() actorName = '';
  @Input() skillCategory: 'basic' | 'ultimate' = 'basic';
}
