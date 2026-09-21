import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coder-banh-basic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coder-banh-basic.component.html',
  styleUrl: './coder-banh-basic.component.scss'
})
export class CoderBanhBasicComponent {
  @Input() phase: 'cast' | 'impact' = 'cast';
  @Input() isTeamRight = false;
}
