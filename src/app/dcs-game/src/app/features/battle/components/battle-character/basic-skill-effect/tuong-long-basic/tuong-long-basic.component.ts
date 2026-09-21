import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tuong-long-basic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tuong-long-basic.component.html',
  styleUrl: './tuong-long-basic.component.scss'
})
export class TuongLongBasicComponent {
  @Input() phase: 'cast' | 'impact' = 'cast';
  @Input() isTeamRight = false;
}
