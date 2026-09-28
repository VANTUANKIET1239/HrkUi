import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type SibaWingPhase = 'idle' | 'descent' | 'embrace' | 'pulse' | 'burst' | 'ascend';
export type SibaWingVariant = 'divine' | 'offense' | 'defense';

@Component({
  selector: 'app-siba-blessing-wings',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="siba-blessing-wings-root"
      [class]="'phase-' + phase + ' variant-' + variant"
      [class.mini]="isMini"
      [class.mirrored]="isTeamRight"
      [style.--visual-speed]="visualSpeed"
    >
      <!-- Circular Sacred Feather Shockwave on Burst -->
      @if (phase === 'burst' || phase === 'ascend') {
        <div class="feather-burst-shockwave">
          <div class="shockwave-ring"></div>
          <div class="burst-feather f1">🪶</div>
          <div class="burst-feather f2">🪶</div>
          <div class="burst-feather f3">🪶</div>
          <div class="burst-feather f4">🪶</div>
        </div>
      }

      <!-- Center Divine Aura Glow between wings -->
      <div class="wing-center-radiance"></div>

      <!-- LEFT WING CONTAINER -->
      <div class="wing-container wing-left">
        <svg class="wing-svg" viewBox="0 0 160 220" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Wing Body Linear Gradient -->
            <linearGradient id="wing-left-grad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="60%" stop-color="#f8fbff" />
              <stop offset="85%" stop-color="#c9d8ee" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#ffd86a" stop-opacity="0.85" />
            </linearGradient>

            <linearGradient id="wing-gold-trim" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#fffdf0" />
              <stop offset="70%" stop-color="#ffd86a" />
              <stop offset="100%" stop-color="#e7a934" />
            </linearGradient>

            <!-- Soft feather shadow filter -->
            <filter id="wing-shadow-left" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="-2" dy="4" stdDeviation="3" flood-color="rgba(189, 216, 238, 0.4)" />
            </filter>
          </defs>

          <!-- Layer 1: Long Primary Flight Feathers (Outer & Lower) -->
          <g class="tier-primary" filter="url(#wing-shadow-left)">
            <!-- Feather P1 -->
            <path
              d="M135,185 C95,190 20,175 5,115 C2,105 18,100 35,115 C55,132 105,155 135,185 Z"
              fill="url(#wing-left-grad)"
              stroke="url(#wing-gold-trim)"
              stroke-width="1.2"
            />
            <!-- Feather P2 -->
            <path
              d="M130,170 C85,165 15,135 2,75 C0,65 18,65 35,80 C60,105 105,135 130,170 Z"
              fill="url(#wing-left-grad)"
              stroke="url(#wing-gold-trim)"
              stroke-width="1.2"
            />
            <!-- Feather P3 -->
            <path
              d="M125,150 C75,140 18,95 10,40 C8,30 25,32 45,50 C75,75 110,115 125,150 Z"
              fill="url(#wing-left-grad)"
              stroke="url(#wing-gold-trim)"
              stroke-width="1.2"
            />
            <!-- Feather P4 (Top wing tip) -->
            <path
              d="M120,130 C70,100 25,50 25,10 C25,2 42,5 65,30 C90,60 115,95 120,130 Z"
              fill="url(#wing-left-grad)"
              stroke="url(#wing-gold-trim)"
              stroke-width="1.2"
            />
          </g>

          <!-- Layer 2: Secondary Mid Feathers -->
          <g class="tier-secondary">
            <path
              d="M132,165 C100,150 45,120 32,85 C30,78 45,76 60,90 C85,112 118,138 132,165 Z"
              fill="#f8fbff"
              stroke="#ffd86a"
              stroke-width="1"
            />
            <path
              d="M128,145 C95,125 50,90 45,55 C43,48 58,48 75,65 C95,88 116,118 128,145 Z"
              fill="#f8fbff"
              stroke="#ffd86a"
              stroke-width="1"
            />
            <path
              d="M125,125 C95,95 62,65 60,35 C60,28 72,30 88,48 C105,70 120,98 125,125 Z"
              fill="#fffdf0"
              stroke="#ffd86a"
              stroke-width="1"
            />
          </g>

          <!-- Layer 3: Soft Coverts Base Feathers -->
          <g class="tier-coverts">
            <path
              d="M135,175 C120,160 85,135 75,108 C75,102 88,102 100,115 C115,132 128,150 135,175 Z"
              fill="#fffdf0"
              stroke="#e7a934"
              stroke-width="0.8"
            />
            <path
              d="M132,150 C115,130 92,105 88,80 C88,75 98,75 110,90 C120,105 128,128 132,150 Z"
              fill="#fffdf0"
              stroke="#e7a934"
              stroke-width="0.8"
            />
            <ellipse cx="125" cy="140" rx="18" ry="32" transform="rotate(-25 125 140)" fill="rgba(255,253,240,0.85)" />
          </g>
        </svg>
      </div>

      <!-- RIGHT WING CONTAINER -->
      <div class="wing-container wing-right">
        <svg class="wing-svg" viewBox="0 0 160 220" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Wing Body Linear Gradient (Mirrored) -->
            <linearGradient id="wing-right-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="60%" stop-color="#f8fbff" />
              <stop offset="85%" stop-color="#c9d8ee" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#ffd86a" stop-opacity="0.85" />
            </linearGradient>

            <filter id="wing-shadow-right" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="rgba(189, 216, 238, 0.4)" />
            </filter>
          </defs>

          <!-- Layer 1: Long Primary Flight Feathers -->
          <g class="tier-primary" filter="url(#wing-shadow-right)">
            <path
              d="M25,185 C65,190 140,175 155,115 C158,105 142,100 125,115 C105,132 55,155 25,185 Z"
              fill="url(#wing-right-grad)"
              stroke="url(#wing-gold-trim)"
              stroke-width="1.2"
            />
            <path
              d="M30,170 C75,165 145,135 158,75 C160,65 142,65 125,80 C100,105 55,135 30,170 Z"
              fill="url(#wing-right-grad)"
              stroke="url(#wing-gold-trim)"
              stroke-width="1.2"
            />
            <path
              d="M35,150 C85,140 142,95 150,40 C152,30 135,32 115,50 C85,75 50,115 35,150 Z"
              fill="url(#wing-right-grad)"
              stroke="url(#wing-gold-trim)"
              stroke-width="1.2"
            />
            <path
              d="M40,130 C90,100 135,50 135,10 C135,2 118,5 95,30 C70,60 45,95 40,130 Z"
              fill="url(#wing-right-grad)"
              stroke="url(#wing-gold-trim)"
              stroke-width="1.2"
            />
          </g>

          <!-- Layer 2: Secondary Mid Feathers -->
          <g class="tier-secondary">
            <path
              d="M28,165 C60,150 115,120 128,85 C130,78 115,76 100,90 C75,112 42,138 28,165 Z"
              fill="#f8fbff"
              stroke="#ffd86a"
              stroke-width="1"
            />
            <path
              d="M32,145 C65,125 110,90 115,55 C117,48 102,48 85,65 C65,88 44,118 32,145 Z"
              fill="#f8fbff"
              stroke="#ffd86a"
              stroke-width="1"
            />
            <path
              d="M35,125 C65,95 98,65 100,35 C100,28 88,30 72,48 C55,70 40,98 35,125 Z"
              fill="#fffdf0"
              stroke="#ffd86a"
              stroke-width="1"
            />
          </g>

          <!-- Layer 3: Soft Coverts Base Feathers -->
          <g class="tier-coverts">
            <path
              d="M25,175 C40,160 75,135 85,108 C85,102 72,102 60,115 C45,132 32,150 25,175 Z"
              fill="#fffdf0"
              stroke="#e7a934"
              stroke-width="0.8"
            />
            <path
              d="M28,150 C45,130 68,105 72,80 C72,75 62,75 50,90 C40,105 32,128 28,150 Z"
              fill="#fffdf0"
              stroke="#e7a934"
              stroke-width="0.8"
            />
            <ellipse cx="35" cy="140" rx="18" ry="32" transform="rotate(25 35 140)" fill="rgba(255,253,240,0.85)" />
          </g>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      transform: translate(-50%, -50%);
      pointer-events: none;
      user-select: none;
      z-index: 5;
    }

    .siba-blessing-wings-root {
      position: relative;
      width: 240px;
      height: 180px;
      display: flex;
      justify-content: center;
      align-items: center;

      &.mini {
        width: 130px;
        height: 100px;
        .wing-container {
          width: 75px;
          height: 100px;
        }
      }

      .wing-center-radiance {
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 253, 240, 0.75) 0%, rgba(255, 216, 106, 0.4) 50%, transparent 75%);
        filter: blur(4px);
        opacity: 0.6;
        transition: opacity 0.3s ease-out, transform 0.3s ease-out;
      }

      // WINGS SETUP & PIVOTS
      .wing-container {
        position: absolute;
        top: -20px;
        width: 140px;
        height: 180px;
        transition: transform 0.38s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease-out;

        .wing-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
          filter: drop-shadow(0 0 8px rgba(255, 216, 106, 0.6));
        }

        &.wing-left {
          left: -15px;
          transform-origin: 88% 88%;
          transform: rotate(10deg) scale(0.65);
        }

        &.wing-right {
          right: -15px;
          transform-origin: 12% 88%;
          transform: rotate(-10deg) scale(0.65);
        }
      }

      // Circular Feather Shockwave
      .feather-burst-shockwave {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        .shockwave-ring {
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid #fffdf0;
          box-shadow: 0 0 20px #ffd86a;
          animation: shockwave-expand calc(0.65s / var(--visual-speed, 1)) ease-out forwards;
        }

        .burst-feather {
          position: absolute;
          font-size: 22px;
          filter: drop-shadow(0 0 6px #ffd86a);

          &.f1 { animation: feather-drift-1 calc(0.7s / var(--visual-speed, 1)) ease-out forwards; }
          &.f2 { animation: feather-drift-2 calc(0.7s / var(--visual-speed, 1)) ease-out forwards; }
          &.f3 { animation: feather-drift-3 calc(0.7s / var(--visual-speed, 1)) ease-out forwards; }
          &.f4 { animation: feather-drift-4 calc(0.7s / var(--visual-speed, 1)) ease-out forwards; }
        }
      }

      // ==============================================================
      // PHASES
      // ==============================================================

      // Phase 1: Idle
      &.phase-idle {
        opacity: 0;
        pointer-events: none;
        .wing-container {
          opacity: 0;
          transform: scale(0.3);
        }
      }

      // Phase 2: Descent (Descending from heaven above target)
      &.phase-descent {
        opacity: 1;
        .wing-container {
          opacity: 0.95;
          &.wing-left {
            transform: translateY(-40px) rotate(-15deg) scale(0.85);
            animation: wing-glide-left calc(0.4s / var(--visual-speed, 1)) ease-out forwards;
          }
          &.wing-right {
            transform: translateY(-40px) rotate(15deg) scale(0.85);
            animation: wing-glide-right calc(0.4s / var(--visual-speed, 1)) ease-out forwards;
          }
        }
      }

      // Phase 3: Embrace (Folding inward around ally)
      &.phase-embrace {
        opacity: 1;
        .wing-center-radiance {
          opacity: 1;
          transform: scale(1.4);
        }
        .wing-container {
          opacity: 1;
          &.wing-left {
            transform: rotate(50deg) scale(1.05) translate(10px, -5px);
          }
          &.wing-right {
            transform: rotate(-50deg) scale(1.05) translate(-10px, -5px);
          }
        }
      }

      // Phase 4: Pulse (Peak luminosity before opening)
      &.phase-pulse {
        opacity: 1;
        .wing-center-radiance {
          opacity: 1;
          transform: scale(1.8);
          background: radial-gradient(circle, #fffdf0 0%, #ffd86a 60%, transparent 80%);
        }
        .wing-container {
          opacity: 1;
          filter: drop-shadow(0 0 16px #fffdf0);
          &.wing-left {
            transform: rotate(45deg) scale(1.12);
          }
          &.wing-right {
            transform: rotate(-45deg) scale(1.12);
          }
        }
      }

      // Phase 5: Burst Open (Unfurl with overshoot)
      &.phase-burst {
        opacity: 1;
        .wing-center-radiance {
          opacity: 0.9;
          transform: scale(1.3);
        }
        .wing-container {
          opacity: 1;
          &.wing-left {
            transform: rotate(-35deg) scale(1.18) translate(-15px, -10px);
          }
          &.wing-right {
            transform: rotate(35deg) scale(1.18) translate(15px, -10px);
          }
        }
      }

      // Phase 6: Ascend (Flap & Soar upward into heaven)
      &.phase-ascend {
        .wing-container {
          animation: wing-ascend-out calc(0.45s / var(--visual-speed, 1)) ease-in forwards;
          &.wing-left {
            animation-name: wing-ascend-left;
          }
          &.wing-right {
            animation-name: wing-ascend-right;
          }
        }
      }

      // Variants
      &.variant-offense {
        .wing-svg {
          filter: drop-shadow(0 0 10px #f59e0b);
        }
        .wing-center-radiance {
          background: radial-gradient(circle, #ffd86a 0%, #f97316 65%, transparent 80%);
        }
      }

      &.variant-defense {
        .wing-svg {
          filter: drop-shadow(0 0 10px #38bdf8);
        }
        .wing-center-radiance {
          background: radial-gradient(circle, #fffdf0 0%, #38bdf8 65%, transparent 80%);
        }
      }
    }

    // Keyframe Animations
    @keyframes wing-glide-left {
      0% { transform: translateY(-50px) rotate(-25deg) scale(0.7); opacity: 0; }
      100% { transform: translateY(0) rotate(15deg) scale(0.95); opacity: 1; }
    }

    @keyframes wing-glide-right {
      0% { transform: translateY(-50px) rotate(25deg) scale(0.7); opacity: 0; }
      100% { transform: translateY(0) rotate(-15deg) scale(0.95); opacity: 1; }
    }

    @keyframes wing-ascend-left {
      0% { transform: rotate(-35deg) scale(1.18) translate(-15px, -10px); opacity: 1; }
      40% { transform: rotate(15deg) scale(1.1) translate(-25px, -45px); opacity: 0.85; }
      100% { transform: rotate(-40deg) scale(0.9) translate(-40px, -120px); opacity: 0; }
    }

    @keyframes wing-ascend-right {
      0% { transform: rotate(35deg) scale(1.18) translate(15px, -10px); opacity: 1; }
      40% { transform: rotate(-15deg) scale(1.1) translate(25px, -45px); opacity: 0.85; }
      100% { transform: rotate(40deg) scale(0.9) translate(40px, -120px); opacity: 0; }
    }

    @keyframes shockwave-expand {
      0% { width: 40px; height: 40px; opacity: 1; }
      100% { width: 280px; height: 280px; opacity: 0; }
    }

    @keyframes feather-drift-1 {
      0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
      100% { transform: translate(-70px, -45px) rotate(-45deg) scale(1.2); opacity: 0; }
    }
    @keyframes feather-drift-2 {
      0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
      100% { transform: translate(70px, -45px) rotate(45deg) scale(1.2); opacity: 0; }
    }
    @keyframes feather-drift-3 {
      0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
      100% { transform: translate(-50px, 45px) rotate(-20deg) scale(1); opacity: 0; }
    }
    @keyframes feather-drift-4 {
      0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
      100% { transform: translate(50px, 45px) rotate(20deg) scale(1); opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .wing-container {
        transition: opacity 0.2s ease-out !important;
      }
      .feather-burst-shockwave {
        display: none !important;
      }
    }
  `]
})
export class SibaBlessingWingsComponent {
  @Input() phase: SibaWingPhase = 'idle';
  @Input() variant: SibaWingVariant = 'divine';
  @Input() isMini = false;
  @Input() isTeamRight = false;
  @Input() visualSpeed = 1;
}
