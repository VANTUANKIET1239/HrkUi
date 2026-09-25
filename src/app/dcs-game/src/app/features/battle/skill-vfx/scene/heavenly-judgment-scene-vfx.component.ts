import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-heavenly-judgment-scene-vfx',
  standalone: true,
  template: '<div class="aoe-field-shockwave" [class.active]="active"></div>'
})
export class HeavenlyJudgmentSceneVfxComponent {
  @Input() active = false;
}
