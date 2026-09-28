import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-siba-angel-blessing-resource',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './siba-angel-blessing.component.html',
  styleUrl: './siba-angel-blessing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SibaAngelBlessingComponent {
  @Input() currentBlessing = 0;
  @Input() maxBlessing = 5;
  @Input() isFullBlessing = false;
  @Input() visualSpeed = 1;
  @Input() team: 'left' | 'right' = 'left';

  readonly blessingSlots = [1, 2, 3, 4, 5];
}
