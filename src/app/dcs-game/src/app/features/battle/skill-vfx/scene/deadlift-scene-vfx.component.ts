import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-deadlift-scene-vfx',
  standalone: true,
  template: `
    <div class="deadlift-scene-lightning" [class.caster-right]="actorTeamRight" [class.caster-left]="!actorTeamRight">
      <div class="deadlift-field-flash"></div>
      @for (bolt of bolts; track bolt) {
        <div class="deadlift-lightning-bolt" [class.dlb1]="bolt === 1" [class.dlb2]="bolt === 2" [class.dlb3]="bolt === 3">
          <div class="bolt-core"></div><div class="bolt-glow"></div>
          <div class="bolt-branch bb-a"></div><div class="bolt-branch bb-b"></div>
          <div class="bolt-impact"></div>
        </div>
      }
      <div class="deadlift-origin-burst"></div>
    </div>`
})
export class DeadliftSceneVfxComponent {
  @Input() actorTeamRight = false;
  readonly bolts = [1, 2, 3];
}
