import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type SibaHaloVariant = 'basic' | 'normal' | 'empowered' | 'caster';

@Component({
  selector: 'app-siba-halo',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="siba-halo-wrapper"
      [class]="'variant-' + variant"
      [class.active]="active"
      [style.--visual-speed]="visualSpeed"
    >
      <svg
        class="halo-svg"
        viewBox="0 0 120 50"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <!-- Soft golden outer glow -->
          <filter id="halo-glow-filter" x="-30%" y="-50%" width="160%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- Intense radiant flare for empowered/caster -->
          <filter id="halo-intense-glow" x="-50%" y="-80%" width="200%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blurWide" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blurCore" />
            <feMerge>
              <feMergeNode in="blurWide" />
              <feMergeNode in="blurCore" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- Golden gradient ring -->
          <linearGradient id="halo-gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ffd86a" stop-opacity="0.75" />
            <stop offset="50%" stop-color="#fffdf0" stop-opacity="1" />
            <stop offset="100%" stop-color="#ffd86a" stop-opacity="0.75" />
          </linearGradient>

          <!-- Divine celestial gradient -->
          <linearGradient id="halo-divine-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e7a934" />
            <stop offset="50%" stop-color="#fffdf0" />
            <stop offset="100%" stop-color="#bde8ff" />
          </linearGradient>
        </defs>

        <!-- Outer Ethereal Halo Aura -->
        <ellipse
          cx="60"
          cy="25"
          rx="48"
          ry="15"
          class="halo-outer-aura"
          [attr.filter]="variant === 'empowered' || variant === 'caster' ? 'url(#halo-intense-glow)' : 'url(#halo-glow-filter)'"
        />

        <!-- Secondary Ornate Ring (Empowered & Normal) -->
        @if (variant === 'normal' || variant === 'empowered' || variant === 'caster') {
          <ellipse
            cx="60"
            cy="25"
            rx="43"
            ry="13"
            class="halo-secondary-ring"
          />
        }

        <!-- Primary White-Gold Halo Ring -->
        <ellipse
          cx="60"
          cy="25"
          rx="38"
          ry="11"
          class="halo-primary-ring"
        />

        <!-- Inner Blinding Core Ring -->
        <ellipse
          cx="60"
          cy="25"
          rx="34"
          ry="9.5"
          class="halo-inner-core"
        />

        <!-- Sunray Diamonds for Empowered & Caster variants -->
        @if (variant === 'empowered' || variant === 'caster') {
          <g class="halo-sunrays">
            <polygon points="60,4 62,11 60,9 58,11" class="sunray" />
            <polygon points="60,46 62,39 60,41 58,39" class="sunray" />
            <polygon points="12,25 21,24 19,25 21,26" class="sunray" />
            <polygon points="108,25 99,24 101,25 99,26" class="sunray" />
            <polygon points="26,13 34,15 32,16 33,18" class="sunray" />
            <polygon points="94,13 86,15 88,16 87,18" class="sunray" />
            <polygon points="26,37 34,35 32,34 33,32" class="sunray" />
            <polygon points="94,37 86,35 88,34 87,32" class="sunray" />
          </g>
        }
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      pointer-events: none;
      user-select: none;
    }

    .siba-halo-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0.65) translateY(6px);
      transition: opacity 0.25s ease-out, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);

      &.active {
        opacity: 1;
        transform: scale(1) translateY(0);
        animation: halo-float calc(1.8s / var(--visual-speed, 1)) infinite ease-in-out alternate;
      }

      &.variant-basic {
        width: 60px;
        height: 25px;

        .halo-primary-ring {
          stroke: url(#halo-gold-grad);
          stroke-width: 2.2;
          fill: none;
        }

        .halo-inner-core {
          stroke: #fffdf0;
          stroke-width: 1.2;
          fill: none;
        }

        .halo-outer-aura {
          stroke: rgba(255, 216, 106, 0.45);
          stroke-width: 4;
          fill: rgba(255, 253, 240, 0.08);
        }
      }

      &.variant-normal {
        width: 80px;
        height: 34px;

        .halo-primary-ring {
          stroke: url(#halo-gold-grad);
          stroke-width: 2.8;
          fill: none;
        }

        .halo-secondary-ring {
          stroke: #e7a934;
          stroke-width: 1.4;
          stroke-dasharray: 4 3;
          fill: none;
        }

        .halo-inner-core {
          stroke: #fffdf0;
          stroke-width: 1.6;
          fill: none;
        }

        .halo-outer-aura {
          stroke: rgba(255, 216, 106, 0.6);
          stroke-width: 6;
          fill: rgba(254, 240, 138, 0.12);
        }
      }

      &.variant-empowered,
      &.variant-caster {
        width: 104px;
        height: 44px;

        .halo-primary-ring {
          stroke: url(#halo-divine-grad);
          stroke-width: 3.4;
          fill: none;
        }

        .halo-secondary-ring {
          stroke: #ffd86a;
          stroke-width: 1.8;
          stroke-dasharray: 6 3;
          fill: none;
        }

        .halo-inner-core {
          stroke: #fffdf0;
          stroke-width: 2.2;
          fill: rgba(255, 253, 240, 0.18);
        }

        .halo-outer-aura {
          stroke: rgba(255, 216, 106, 0.85);
          stroke-width: 8;
          fill: rgba(254, 240, 138, 0.2);
        }

        .sunray {
          fill: #fffdf0;
          filter: drop-shadow(0 0 3px #ffd86a);
          animation: sunray-pulse calc(0.9s / var(--visual-speed, 1)) infinite alternate ease-in-out;
        }
      }

      .halo-svg {
        width: 100%;
        height: 100%;
        overflow: visible;
      }
    }

    @keyframes halo-float {
      0% {
        transform: translateY(0px) rotate(0deg);
      }
      100% {
        transform: translateY(-4px) rotate(0.8deg);
      }
    }

    @keyframes sunray-pulse {
      0% {
        opacity: 0.6;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1.15);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .siba-halo-wrapper.active {
        animation: none;
      }
      .sunray {
        animation: none !important;
      }
    }
  `]
})
export class SibaHaloComponent {
  @Input() variant: SibaHaloVariant = 'normal';
  @Input() visualSpeed = 1;
  @Input() active = true;
}
