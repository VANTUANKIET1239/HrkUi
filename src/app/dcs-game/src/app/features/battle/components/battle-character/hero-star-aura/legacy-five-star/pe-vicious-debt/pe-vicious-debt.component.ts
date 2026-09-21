import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../../../../core/models/hero.model';

@Component({
  selector: 'app-pe-vicious-debt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pe-vicious-debt.component.html',
  styleUrl: './pe-vicious-debt.component.scss'
})
export class PeViciousDebtComponent {
  @Input({ required: true }) character!: Hero;

  get isBankrupt(): boolean {
    return this.character?.statusEffects?.some((e: string) => e.startsWith('Bankruptcy')) || false;
  }
}
