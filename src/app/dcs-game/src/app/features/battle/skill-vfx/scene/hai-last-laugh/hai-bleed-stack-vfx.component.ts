import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hai-bleed-stack-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bleed-stack-root" *ngIf="stacks > 0" [class.is-stacking-up]="isStackingUp">
      <!-- Thin Crimson Wound Cut Trace -->
      <div class="crimson-slash-trace"></div>

      <!-- Stylized Blood Drop & Badge Container -->
      <div class="bleed-badge-container">
        <!-- Blood Icon SVG -->
        <svg viewBox="0 0 24 28" class="blood-icon-svg">
          <path d="M12,2 C12,2 4,13 4,19 C4,23.4 7.6,27 12,27 C16.4,27 20,23.4 20,19 C20,13 12,2 12,2 Z" class="drop-path" />
          <path d="M14,14 C14,14 10,19 10,21 C10,22.1 10.9,23 12,23" class="drop-highlight" />
        </svg>

        <!-- Stack Count Badge: 1/2 or 2/2 -->
        <span class="stack-text">{{ stacks }}/2</span>
      </div>

      <!-- Level Up Red Flash Burst when stacks change 1 -> 2 -->
      <div class="bleed-pop-pulse" *ngIf="isStackingUp"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      width: 120px;
      height: 60px;
      transform: translate(-50%, -100%);
      pointer-events: none;
      z-index: 28;
    }

    .bleed-stack-root {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Thin Red Cut Line across blue slash */
    .crimson-slash-trace {
      position: absolute;
      width: 180px;
      height: 2px;
      top: 50%;
      left: -30px;
      background: linear-gradient(90deg, transparent, #ff1744, #ff5252, #ff1744, transparent);
      box-shadow: 0 0 8px #ff1744;
      transform: rotate(-30deg);
      opacity: 0.85;
      animation: trace-glow 0.8s ease-in-out infinite alternate;
    }

    @keyframes trace-glow {
      0% { opacity: 0.5; filter: drop-shadow(0 0 2px #ff1744); }
      100% { opacity: 1; filter: drop-shadow(0 0 8px #ff1744); }
    }

    /* Badge */
    .bleed-badge-container {
      position: relative;
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(20, 2, 8, 0.85);
      border: 1.5px solid #ff1744;
      border-radius: 12px;
      padding: 3px 8px;
      box-shadow: 0 0 12px rgba(255, 23, 68, 0.5);
      transform: scale(1);
      transition: transform 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    }

    .bleed-stack-root.is-stacking-up .bleed-badge-container {
      animation: badge-bounce 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
    }

    @keyframes badge-bounce {
      0% { transform: scale(1); }
      40% { transform: scale(1.45); border-color: #ff5252; box-shadow: 0 0 22px #ff1744; }
      100% { transform: scale(1); }
    }

    .blood-icon-svg {
      width: 16px;
      height: 18px;
    }

    .drop-path {
      fill: #ff1744;
      filter: drop-shadow(0 0 4px #ff1744);
    }

    .drop-highlight {
      fill: none;
      stroke: #ffffff;
      stroke-width: 1.5;
      stroke-linecap: round;
      opacity: 0.7;
    }

    .stack-text {
      font-size: 13px;
      font-weight: 900;
      color: #ff5252;
      text-shadow: 0 0 8px #ff1744;
      letter-spacing: 1px;
    }

    .bleed-pop-pulse {
      position: absolute;
      width: 45px;
      height: 45px;
      border-radius: 50%;
      border: 2px solid #ff1744;
      box-shadow: 0 0 14px #ff1744;
      animation: pop-pulse-fade 0.35s ease-out forwards;
    }

    @keyframes pop-pulse-fade {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .bleed-badge-container, .crimson-slash-trace {
        animation: none !important;
      }
      .bleed-pop-pulse {
        display: none !important;
      }
    }
  `]
})
export class HaiBleedStackVfxComponent {
  @Input() stacks = 0;
  @Input() isStackingUp = false;
}
