import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-siba-dispel-particles',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="siba-dispel-root"
      [class.active]="active"
      [style.--visual-speed]="visualSpeed"
    >
      <!-- 1. Sweeping Golden Feather -->
      <div class="sweeping-feather-track">
        <div class="purifying-feather">🪶</div>
        <div class="feather-light-trail"></div>
      </div>

      <!-- 2. Dark Fragment Debuff Shatter -->
      <div class="dark-shatter-container">
        <span class="shard s1"></span>
        <span class="shard s2"></span>
        <span class="shard s3"></span>
        <span class="shard s4"></span>
        <span class="shard s5"></span>
      </div>

      <!-- 3. Golden Stardust Sparkle Burst -->
      <div class="stardust-burst">
        <div class="stardust-core"></div>
        <span class="star-spark spk1">✦</span>
        <span class="star-spark spk2">✦</span>
        <span class="star-spark spk3">✦</span>
        <span class="star-spark spk4">✦</span>
      </div>

      <!-- 4. Purifying Expanding Light Pulse -->
      <div class="purify-pulse-ring"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      transform: translate(-50%, -50%);
      pointer-events: none;
      user-select: none;
      z-index: 15;
    }

    .siba-dispel-root {
      position: relative;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;

      &.active {
        opacity: 1;

        .purifying-feather {
          animation: feather-sweep calc(0.55s / var(--visual-speed, 1)) ease-out forwards;
        }

        .feather-light-trail {
          animation: trail-fade calc(0.55s / var(--visual-speed, 1)) ease-out forwards;
        }

        .shard {
          animation: shard-shatter calc(0.48s / var(--visual-speed, 1)) ease-out forwards;
        }

        .stardust-core {
          animation: stardust-expand calc(0.5s / var(--visual-speed, 1)) ease-out forwards;
        }

        .star-spark {
          animation: spark-fly calc(0.5s / var(--visual-speed, 1)) ease-out forwards;
        }

        .purify-pulse-ring {
          animation: purify-ring-out calc(0.55s / var(--visual-speed, 1)) ease-out forwards;
        }
      }

      // 1. Sweeping Feather
      .sweeping-feather-track {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        .purifying-feather {
          position: absolute;
          font-size: 26px;
          filter: drop-shadow(0 0 10px #ffd86a) drop-shadow(0 0 20px #fffdf0);
        }

        .feather-light-trail {
          position: absolute;
          width: 80px;
          height: 14px;
          border-radius: 999px;
          background: linear-gradient(to right, transparent, rgba(255, 216, 106, 0.7), #fffdf0);
          filter: blur(2px);
        }
      }

      // 2. Dark Shards (Shattered debuff residue)
      .dark-shatter-container {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        .shard {
          position: absolute;
          width: 7px;
          height: 7px;
          background: #312e81;
          border: 1px solid #6366f1;
          border-radius: 2px;
          box-shadow: 0 0 6px rgba(99, 102, 241, 0.6);

          &.s1 { transform: rotate(15deg); }
          &.s2 { transform: rotate(85deg); }
          &.s3 { transform: rotate(155deg); }
          &.s4 { transform: rotate(225deg); }
          &.s5 { transform: rotate(305deg); }
        }
      }

      // 3. Stardust
      .stardust-burst {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        .stardust-core {
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: radial-gradient(circle, #fffdf0 0%, rgba(255, 216, 106, 0.6) 40%, transparent 75%);
          filter: blur(3px);
        }

        .star-spark {
          position: absolute;
          font-size: 14px;
          color: #fffdf0;
          text-shadow: 0 0 8px #ffd86a;

          &.spk1 { --tx: -35px; --ty: -35px; }
          &.spk2 { --tx: 35px; --ty: -35px; }
          &.spk3 { --tx: -35px; --ty: 35px; }
          &.spk4 { --tx: 35px; --ty: 35px; }
        }
      }

      // 4. Purify Ring
      .purify-pulse-ring {
        position: absolute;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px dashed rgba(255, 216, 106, 0.9);
        box-shadow: 0 0 15px rgba(255, 253, 240, 0.8);
      }
    }

    // Keyframes
    @keyframes feather-sweep {
      0% {
        transform: translate(-45px, 25px) rotate(-35deg) scale(0.6);
        opacity: 0;
      }
      35% {
        transform: translate(0px, -5px) rotate(10deg) scale(1.15);
        opacity: 1;
      }
      100% {
        transform: translate(45px, -35px) rotate(45deg) scale(0.7);
        opacity: 0;
      }
    }

    @keyframes trail-fade {
      0% { opacity: 0; transform: scaleX(0.2) rotate(-15deg); }
      40% { opacity: 0.8; transform: scaleX(1) rotate(5deg); }
      100% { opacity: 0; transform: scaleX(1.3) rotate(25deg); }
    }

    @keyframes shard-shatter {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(calc(cos(var(--a, 45deg)) * 40px), calc(sin(var(--a, 45deg)) * 40px)) scale(0.2) rotate(180deg);
        opacity: 0;
      }
    }

    @keyframes stardust-expand {
      0% { transform: scale(0.3); opacity: 1; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    @keyframes spark-fly {
      0% { transform: translate(0, 0) scale(0.4); opacity: 1; }
      100% { transform: translate(var(--tx), var(--ty)) scale(1.2); opacity: 0; }
    }

    @keyframes purify-ring-out {
      0% { width: 30px; height: 30px; opacity: 1; }
      100% { width: 110px; height: 110px; opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .purifying-feather,
      .shard,
      .star-spark {
        animation: none !important;
      }
      .stardust-core {
        animation: stardust-expand calc(0.3s / var(--visual-speed, 1)) ease-out forwards !important;
      }
    }
  `]
})
export class SibaDispelParticlesComponent {
  @Input() active = false;
  @Input() visualSpeed = 1;
}
