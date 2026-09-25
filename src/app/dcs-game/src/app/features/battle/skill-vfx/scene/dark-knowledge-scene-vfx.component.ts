import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dark-knowledge-scene-vfx',
  standalone: true,
  template: `
    <div class="dark-knowledge-scene-fx">
      <div class="sky-rift-slit" [class.active]="actorActive"></div>
      <div class="falling-dark-book-container" [class.active]="actorActive">
        <img src="/assets/images/dcs-game/sach-bongtoi.png" class="falling-dark-book" alt="Dark Knowledge" />
      </div>
      <div class="center-explosion" [class.active]="impactActive">
        <div class="exp-shockwave"></div>
        <div class="exp-mist"></div>
        <div class="exp-pages">
          <span class="ep-page ep1"></span><span class="ep-page ep2"></span>
          <span class="ep-page ep3"></span><span class="ep-page ep4"></span>
          <span class="ep-page ep5"></span><span class="ep-page ep6"></span>
        </div>
      </div>
    </div>`
})
export class DarkKnowledgeSceneVfxComponent {
  @Input() actorActive = false;
  @Input() impactActive = false;
}
