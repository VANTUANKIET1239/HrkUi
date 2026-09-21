import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../../../../core/models/hero.model';

@Component({
  selector: 'app-pe-heavy-iron-aura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pe-heavy-iron-aura.component.html',
  styleUrl: './pe-heavy-iron-aura.component.scss'
})
export class PeHeavyIronAuraComponent {
  @Input({ required: true }) character!: Hero;
}
