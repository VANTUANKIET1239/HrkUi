import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chuan-men-basic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chuan-men-basic.component.html',
  styleUrl: './chuan-men-basic.component.scss'
})
export class ChuanMenBasicComponent {
  @Input() phase: 'cast' | 'impact' = 'cast';
  @Input() isTeamRight = false;
}
