import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hai-bleed-detonation-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="detonation-root">
      <!-- Imploding Red Core (contracts 80-120ms then bursts) -->
      <div class="imploding-crimson-core"></div>

      <!-- Dual Shockwave Rings: Outer Red, Inner Cyan -->
      <div class="shockwave-outer-crimson"></div>
      <div class="shockwave-inner-cyan"></div>

      <!-- Momentary Crimson Flash of the Slashes -->
      <div class="crimson-cross-flash">
        <span class="c-flash c1"></span>
        <span class="c-flash c2"></span>
      </div>

      <!-- Ground Energy Fractures / Red Crack Lines -->
      <svg viewBox="0 0 240 240" class="cracks-svg">
        <path d="M120,120 L80,70 L50,80 M120,120 L160,65 L190,50 M120,120 L70,170 L40,165 M120,120 L175,175 L205,190 M120,120 L120,40 M120,120 L120,200" class="crack-path" />
      </svg>

      <!-- Stylized Crimson Geometric Crystal Shards -->
      <div class="crystal-shards">
        <span class="c-shard cs1" style="--angle: 30deg; --d: 110px;"></span>
        <span class="c-shard cs2" style="--angle: 85deg; --d: 125px;"></span>
        <span class="c-shard cs3" style="--angle: 140deg; --d: 105px;"></span>
        <span class="c-shard cs4" style="--angle: 210deg; --d: 130px;"></span>
        <span class="c-shard cs5" style="--angle: 265deg; --d: 115px;"></span>
        <span class="c-shard cs6" style="--angle: 325deg; --d: 120px;"></span>
      </div>

      <!-- Detonation Flash -->
      <div class="detonation-flash"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      width: 320px;
      height: 320px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 29;
    }

    .detonation-root {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Imploding Red Core */
    .imploding-crimson-core {
      position: absolute;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: radial-gradient(circle, #ffffff 0%, #ff1744 40%, #b71c1c 80%, transparent 100%);
      box-shadow: 0 0 20px #ff1744, 0 0 40px #ff5252;
      animation: core-implode-burst 0.38s cubic-bezier(0.7, 0, 0.3, 1) forwards;
    }

    @keyframes core-implode-burst {
      0% {
        transform: scale(1.4);
        opacity: 0.8;
      }
      28% {
        transform: scale(0.2);
        opacity: 1;
        filter: brightness(2.5);
      }
      35% {
        transform: scale(2.8);
        opacity: 1;
      }
      100% {
        transform: scale(3.5);
        opacity: 0;
      }
    }

    /* Outer Crimson Shockwave Ring */
    .shockwave-outer-crimson {
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 3.5px solid #ff1744;
      box-shadow: 0 0 20px #ff1744, inset 0 0 10px #ff1744;
      animation: shockwave-out-crimson 0.42s 0.1s cubic-bezier(0.1, 0.85, 0.2, 1) forwards;
    }

    @keyframes shockwave-out-crimson {
      0% { transform: scale(0.2); opacity: 1; }
      100% { transform: scale(2.8); opacity: 0; }
    }

    /* Inner Cyan Shockwave Ring */
    .shockwave-inner-cyan {
      position: absolute;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      border: 2px solid #00f0ff;
      box-shadow: 0 0 14px #00f0ff;
      animation: shockwave-in-cyan 0.36s 0.12s cubic-bezier(0.1, 0.85, 0.2, 1) forwards;
    }

    @keyframes shockwave-in-cyan {
      0% { transform: scale(0.2); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }

    /* Momentary Crimson Flash of Slashes */
    .crimson-cross-flash {
      position: absolute;
      width: 280px;
      height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .c-flash {
      position: absolute;
      width: 320px;
      height: 12px;
      background: linear-gradient(90deg, transparent, #ff1744, #ffffff, #ff1744, transparent);
      box-shadow: 0 0 16px #ff1744;
      border-radius: 6px;
      animation: flash-cross-anim 0.25s 0.1s ease-out forwards;
      opacity: 0;
    }

    .c1 { transform: rotate(-45deg); }
    .c2 { transform: rotate(45deg); }

    @keyframes flash-cross-anim {
      0% { opacity: 0; transform: scaleX(0.2) rotate(var(--rot, -45deg)); }
      30% { opacity: 1; transform: scaleX(1.2) rotate(var(--rot, -45deg)); }
      100% { opacity: 0; transform: scaleX(1) rotate(var(--rot, -45deg)); }
    }

    .c1 { --rot: -45deg; }
    .c2 { --rot: 45deg; }

    /* Energy Fracture Cracks */
    .cracks-svg {
      position: absolute;
      width: 240px;
      height: 240px;
      z-index: 1;
    }

    .crack-path {
      fill: none;
      stroke: #ff1744;
      stroke-width: 2;
      stroke-linecap: round;
      filter: drop-shadow(0 0 6px #ff1744);
      stroke-dasharray: 180;
      stroke-dashoffset: 180;
      animation: crack-spread 0.35s 0.1s ease-out forwards;
    }

    @keyframes crack-spread {
      0% { stroke-dashoffset: 180; opacity: 1; }
      70% { stroke-dashoffset: 0; opacity: 1; }
      100% { stroke-dashoffset: 0; opacity: 0; }
    }

    /* Crimson Crystal Shards */
    .crystal-shards {
      position: absolute;
      inset: 0;
    }

    .c-shard {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 12px solid #ff1744;
      filter: drop-shadow(0 0 6px #ff1744);
      animation: c-shard-burst 0.45s 0.1s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
      opacity: 0;
    }

    @keyframes c-shard-burst {
      0% {
        transform: translate(-50%, -50%) rotate(var(--angle)) scale(1.4);
        opacity: 1;
      }
      100% {
        transform: translate(calc(-50% + cos(var(--angle)) * var(--d)), calc(-50% + sin(var(--angle)) * var(--d))) rotate(calc(var(--angle) + 180deg)) scale(0.2);
        opacity: 0;
      }
    }

    .detonation-flash {
      position: absolute;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: radial-gradient(circle, #ffffff 0%, rgba(255, 23, 68, 0.8) 45%, transparent 70%);
      animation: det-flash 0.18s 0.1s ease-out forwards;
      opacity: 0;
    }

    @keyframes det-flash {
      0% { opacity: 1; transform: scale(0.6); }
      100% { opacity: 0; transform: scale(1.6); }
    }

    @media (prefers-reduced-motion: reduce) {
      .crystal-shards, .cracks-svg {
        display: none !important;
      }
      .imploding-crimson-core, .shockwave-outer-crimson {
        animation-duration: 0.15s !important;
      }
    }
  `]
})
export class HaiBleedDetonationVfxComponent {}
