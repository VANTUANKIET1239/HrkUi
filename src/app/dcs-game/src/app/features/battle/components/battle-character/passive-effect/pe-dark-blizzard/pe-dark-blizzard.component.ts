import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../../../core/models/hero.model';

@Component({
  selector: 'app-pe-dark-blizzard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pe-dark-blizzard.component.html',
  styleUrl: './pe-dark-blizzard.component.scss'
})
export class PeDarkBlizzardComponent {
  @Input({ required: true }) character!: Hero;
}
