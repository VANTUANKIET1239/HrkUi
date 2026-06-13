import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleSceneComponent } from '../../components/battle-scene/battle-scene.component';

@Component({
  selector: 'app-battle-page',
  standalone: true,
  imports: [CommonModule, BattleSceneComponent],
  templateUrl: './battle-page.component.html',
  styleUrl: './battle-page.component.scss'
})
export class BattlePageComponent {}
export default BattlePageComponent;
