import { Component, Input } from '@angular/core';
import { HrkImageDirective } from '../../../../../../../../libs/shared/ui/controls/hrk-image/hrk-image.directive';

@Component({
  selector: 'app-ricardo-scene-vfx',
  standalone: true,
  imports: [HrkImageDirective],
  template: `
    @if (empowered) {
      <div class="ricardo-scene-impact"
        [class.target-left]="actorTeamRight"
        [class.target-right]="!actorTeamRight"
        [style.--visual-speed]="visualSpeed">
        <div class="ricardo-ground-shatter">
          <img src="/assets/images/dcs-game/skill-vfx/shared/ground-shatter-transparent.png" alt="" loading="eager" fetchpriority="high" />
        </div>
        <div class="ricardo-dust-impact">
          <img src="/assets/images/dcs-game/skill-vfx/shared/dust-impact-transparent.png" alt="" loading="eager" fetchpriority="high" />
        </div>
      </div>
    }
  `,
  styleUrl: './ricardo-scene-vfx.component.scss'
})
export class RicardoSceneVfxComponent {
  @Input() actorTeamRight = false;
  @Input() empowered = false;
  @Input() visualSpeed = 1;
}
