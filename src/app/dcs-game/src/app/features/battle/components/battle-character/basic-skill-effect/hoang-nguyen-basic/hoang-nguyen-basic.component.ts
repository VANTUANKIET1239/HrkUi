import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hoang-nguyen-basic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hoang-nguyen-basic.component.html',
  styleUrl: './hoang-nguyen-basic.component.scss'
})
export class HoangNguyenBasicComponent {
  @Input() phase: 'cast' | 'impact' = 'cast';
  @Input() isTeamRight = false;
}
