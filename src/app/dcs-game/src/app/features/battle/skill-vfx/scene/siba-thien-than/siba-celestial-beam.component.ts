import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type SibaBeamVariant = 'basic' | 'normal' | 'empowered';

@Component({
  selector: 'app-siba-celestial-beam',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="celestial-beam-container"
      [class]="'variant-' + variant"
      [class.phase-focus]="phase === 'focus'"
      [class.phase-descent]="phase === 'descent'"
      [class.phase-impact]="phase === 'impact'"
      [class.phase-recovery]="phase === 'recovery'"
      [style.--visual-speed]="visualSpeed"
      [style.--beam-height.px]="beamHeight"
    >
      <!-- 1. Overhead Heavenly Focus Rune -->
      @if (showRune) {
        <div class="overhead-rune">
          <svg class="rune-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="rune-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="50" r="44" class="rune-circle-outer" filter="url(#rune-glow)" />
            <circle cx="50" cy="50" r="38" class="rune-circle-mid" stroke-dasharray="6 4" />
            <circle cx="50" cy="50" r="28" class="rune-circle-inner" />
            <!-- 6-Pointed Star of Blessing -->
            <polygon points="50,14 62,38 88,38 67,54 75,78 50,64 25,78 33,54 12,38 38,38" class="rune-star" />
            <circle cx="50" cy="50" r="6" class="rune-core" />
          </svg>
          <div class="rune-focus-flare"></div>
        </div>
      }

      <!-- 2. Divine Tapered Light Beam -->
      <div class="divine-beam-column">
        <!-- SVG Tapered Beam Shape (Narrower top, wider bottom) -->
        <svg
          class="tapered-beam-svg"
          preserveAspectRatio="none"
          viewBox="0 0 100 300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="beam-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#fffdf0" stop-opacity="0.9" />
              <stop offset="25%" stop-color="#ffd86a" stop-opacity="0.65" />
              <stop offset="85%" stop-color="#bde8ff" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#ffd86a" stop-opacity="0.1" />
            </linearGradient>

            <linearGradient id="beam-core-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
              <stop offset="70%" stop-color="#fffdf0" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#fffdf0" stop-opacity="0.3" />
            </linearGradient>
          </defs>

          <!-- Outer Soft Glow Body -->
          <polygon
            points="38,0 62,0 85,300 15,300"
            fill="url(#beam-body-grad)"
            class="beam-polygon-outer"
          />

          <!-- Inner Blinding White Core -->
          <polygon
            points="45,0 55,0 68,300 32,300"
            fill="url(#beam-core-grad)"
            class="beam-polygon-core"
          />
        </svg>

        <!-- Shimmering Light Dust Floating down the beam -->
        <div class="beam-particles">
          <span class="mote m1"></span>
          <span class="mote m2"></span>
          <span class="mote m3"></span>
          <span class="mote m4"></span>
          <span class="mote m5"></span>
        </div>
      </div>

      <!-- 3. Ground Impact Ring & Floor Bloom -->
      @if (showGroundRing) {
        <div class="ground-impact-area">
          <div class="ground-ripple-outer"></div>
          <div class="ground-ripple-inner"></div>
          <div class="ground-floor-bloom"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      transform: translate(-50%, -100%);
      pointer-events: none;
      user-select: none;
    }

    .celestial-beam-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 120px;
      height: var(--beam-height, 320px);

      // 1. Overhead Rune
      .overhead-rune {
        position: absolute;
        top: -35px;
        width: 72px;
        height: 72px;
        opacity: 0;
        transform: scale(0.4) rotate(-30deg);
        transition: opacity 0.25s ease-out, transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);

        .rune-svg {
          width: 100%;
          height: 100%;
          animation: rune-spin calc(7s / var(--visual-speed, 1)) linear infinite;

          .rune-circle-outer {
            stroke: #ffd86a;
            stroke-width: 2.2;
            fill: rgba(254, 240, 138, 0.08);
          }

          .rune-circle-mid {
            stroke: #fffdf0;
            stroke-width: 1.5;
            fill: none;
          }

          .rune-circle-inner {
            stroke: #e7a934;
            stroke-width: 1.2;
            fill: none;
          }

          .rune-star {
            stroke: #ffd86a;
            stroke-width: 1.4;
            fill: rgba(255, 253, 240, 0.25);
          }

          .rune-core {
            fill: #fffdf0;
            filter: drop-shadow(0 0 4px #ffd86a);
          }
        }

        .rune-focus-flare {
          position: absolute;
          inset: 15px;
          border-radius: 50%;
          background: radial-gradient(circle, #fffdf0 0%, rgba(255, 216, 106, 0.6) 45%, transparent 75%);
          filter: blur(2px);
          animation: focus-pulse calc(0.8s / var(--visual-speed, 1)) infinite alternate ease-in-out;
        }
      }

      // 2. Divine Beam Column
      .divine-beam-column {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        transform-origin: top center;
        opacity: 0;
        transform: scaleY(0);
        transition: transform 0.22s ease-out, opacity 0.2s ease-out;

        .tapered-beam-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 12px rgba(255, 216, 106, 0.55));
        }

        .beam-polygon-outer {
          filter: blur(4px);
        }

        .beam-polygon-core {
          filter: blur(1.5px);
        }

        .beam-particles {
          position: absolute;
          inset: 0;

          .mote {
            position: absolute;
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: #fffdf0;
            box-shadow: 0 0 4px #ffd86a;
            animation: mote-fall calc(1.4s / var(--visual-speed, 1)) infinite linear;

            &.m1 { left: 42%; top: 15%; animation-delay: 0.1s; }
            &.m2 { left: 56%; top: 30%; animation-delay: 0.4s; width: 4px; height: 4px; }
            &.m3 { left: 35%; top: 55%; animation-delay: 0.7s; }
            &.m4 { left: 62%; top: 70%; animation-delay: 0.25s; }
            &.m5 { left: 48%; top: 85%; animation-delay: 0.85s; }
          }
        }
      }

      // 3. Ground Impact Area
      .ground-impact-area {
        position: absolute;
        bottom: -15px;
        width: 110px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: scale(0.3);
        transition: opacity 0.2s ease-out, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

        .ground-ripple-outer {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid rgba(255, 216, 106, 0.8);
          box-shadow: 0 0 16px rgba(254, 240, 138, 0.7);
          animation: ripple-pulse calc(1.1s / var(--visual-speed, 1)) infinite ease-out;
        }

        .ground-ripple-inner {
          position: absolute;
          width: 65%;
          height: 65%;
          border-radius: 50%;
          border: 1.5px solid #fffdf0;
        }

        .ground-floor-bloom {
          position: absolute;
          width: 85%;
          height: 85%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 253, 240, 0.6) 0%, rgba(255, 216, 106, 0.3) 50%, transparent 75%);
          filter: blur(4px);
        }
      }

      // Phase State Animations
      &.phase-focus {
        .overhead-rune {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
        .ground-impact-area {
          opacity: 0.35;
          transform: scale(0.7);
        }
      }

      &.phase-descent,
      &.phase-impact {
        .overhead-rune {
          opacity: 1;
          transform: scale(1.1) rotate(15deg);
        }
        .divine-beam-column {
          opacity: 1;
          transform: scaleY(1);
        }
        .ground-impact-area {
          opacity: 1;
          transform: scale(1);
        }
      }

      &.phase-recovery {
        .overhead-rune {
          opacity: 0;
          transform: scale(0.6) rotate(45deg);
        }
        .divine-beam-column {
          opacity: 0;
          transform: scaleY(0.1);
        }
        .ground-impact-area {
          opacity: 0;
          transform: scale(1.3);
        }
      }

      // Variant Sizing
      &.variant-empowered {
        width: 150px;
        .overhead-rune {
          width: 90px;
          height: 90px;
          top: -45px;
        }
        .divine-beam-column .tapered-beam-svg {
          filter: drop-shadow(0 0 20px rgba(255, 216, 106, 0.85));
        }
        .ground-impact-area {
          width: 140px;
          height: 44px;
        }
      }
    }

    @keyframes rune-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes focus-pulse {
      0% { transform: scale(0.85); opacity: 0.5; }
      100% { transform: scale(1.2); opacity: 0.95; }
    }

    @keyframes mote-fall {
      0% { transform: translateY(-30px); opacity: 0; }
      20% { opacity: 1; }
      80% { opacity: 0.8; }
      100% { transform: translateY(280px); opacity: 0; }
    }

    @keyframes ripple-pulse {
      0% { transform: scale(0.7); opacity: 1; }
      100% { transform: scale(1.25); opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .rune-svg {
        animation: none !important;
      }
      .mote {
        animation: none !important;
      }
      .divine-beam-column {
        transition: opacity 0.15s ease-out;
        transform: scaleY(1) !important;
      }
    }
  `]
})
export class SibaCelestialBeamComponent {
  @Input() variant: SibaBeamVariant = 'normal';
  @Input() phase: 'idle' | 'focus' | 'descent' | 'impact' | 'recovery' = 'impact';
  @Input() beamHeight = 320;
  @Input() visualSpeed = 1;
  @Input() showRune = true;
  @Input() showGroundRing = true;
}
