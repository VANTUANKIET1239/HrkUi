import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type HaiSlashStage = 'idle' | 'hit1' | 'hit2' | 'hit3' | 'lingering3';

@Component({
  selector: 'app-hai-slash-impact-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="slash-impact-container" [attr.data-stage]="stage" [class.is-crit]="isCrit" [class.is-reverse]="isReverse">

      <!-- ======================================================== -->
      <!-- HIT 1: Upward Diagonal Slash (1000 - 1280ms)              -->
      <!-- ======================================================== -->
      <div class="hit-group hit-1-group" *ngIf="stage === 'hit1'">
        <!-- Impact Flash -->
        <div class="local-impact-flash flash-1"></div>

        <!-- Shockwave Ring -->
        <div class="shockwave-ring ring-1"></div>

        <!-- Upward Diagonal Slash Blade (3 Layers) -->
        <div class="slash-blade-wrapper slash-1-diag">
          <!-- Layer 1: Outer Electric Aura Glow -->
          <div class="blade-layer outer-glow"></div>
          <!-- Layer 2: Energy Blade -->
          <div class="blade-layer energy-blade"></div>
          <!-- Layer 3: White-Hot Core -->
          <div class="blade-layer white-core"></div>
          <!-- Lightning Streak along blade -->
          <svg viewBox="0 0 320 24" class="blade-lightning-svg">
            <polyline points="0,12 50,4 110,20 170,6 230,18 280,8 320,12" class="lightning-stroke" />
          </svg>
        </div>

        <!-- 10 Energy Particles -->
        <div class="energy-particles p-hit1">
          <span class="particle p1" style="--tx: 65px; --ty: -55px;"></span>
          <span class="particle p2" style="--tx: 80px; --ty: -20px;"></span>
          <span class="particle p3" style="--tx: 50px; --ty: 45px;"></span>
          <span class="particle p4" style="--tx: -45px; --ty: -70px;"></span>
          <span class="particle p5" style="--tx: -70px; --ty: -30px;"></span>
          <span class="particle p6" style="--tx: -55px; --ty: 40px;"></span>
          <span class="particle p7" style="--tx: 30px; --ty: -80px;"></span>
          <span class="particle p8" style="--tx: -30px; --ty: 75px;"></span>
          <span class="particle p9" style="--tx: 85px; --ty: 30px;"></span>
          <span class="particle p10" style="--tx: -85px; --ty: -15px;"></span>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- HIT 2: Twin Reverse Slashes & Electric Fork (1320-1620ms) -->
      <!-- ======================================================== -->
      <div class="hit-group hit-2-group" *ngIf="stage === 'hit2'">
        <!-- Impact Flash -->
        <div class="local-impact-flash flash-2"></div>

        <!-- Spiraling Plasma Ring -->
        <div class="plasma-ring-spiral"></div>

        <!-- Slash 2A (Angled reverse downward) -->
        <div class="slash-blade-wrapper slash-2a">
          <div class="blade-layer outer-glow"></div>
          <div class="blade-layer energy-blade"></div>
          <div class="blade-layer white-core"></div>
        </div>

        <!-- Slash 2B (Intersecting cut, 50ms later) -->
        <div class="slash-blade-wrapper slash-2b">
          <div class="blade-layer outer-glow"></div>
          <div class="blade-layer energy-blade"></div>
          <div class="blade-layer white-core"></div>
        </div>

        <!-- 4-Prong Electric Fork -->
        <svg viewBox="0 0 200 200" class="electric-fork-svg">
          <path d="M100,100 L40,30 M100,100 L160,25 M100,100 L25,150 M100,100 L175,160" class="fork-stroke main-fork" />
          <path d="M40,30 L20,10 M160,25 L190,15 M25,150 L10,185 M175,160 L195,190" class="fork-stroke sub-fork" />
        </svg>

        <!-- 14 Energy Particles -->
        <div class="energy-particles p-hit2">
          <span class="particle p1" style="--tx: 90px; --ty: -60px;"></span>
          <span class="particle p2" style="--tx: 110px; --ty: 10px;"></span>
          <span class="particle p3" style="--tx: 75px; --ty: 80px;"></span>
          <span class="particle p4" style="--tx: -80px; --ty: -80px;"></span>
          <span class="particle p5" style="--tx: -105px; --ty: 20px;"></span>
          <span class="particle p6" style="--tx: -70px; --ty: 70px;"></span>
          <span class="particle p7" style="--tx: 20px; --ty: -110px;"></span>
          <span class="particle p8" style="--tx: -20px; --ty: 100px;"></span>
          <span class="particle p9" style="--tx: 120px; --ty: -20px;"></span>
          <span class="particle p10" style="--tx: -115px; --ty: -40px;"></span>
          <span class="particle p11" style="--tx: 50px; --ty: 95px;"></span>
          <span class="particle p12" style="--tx: -55px; --ty: -95px;"></span>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- HIT 3: Climax Colossal Execution X-Slash (1780-2250ms)    -->
      <!-- ======================================================== -->
      <div class="hit-group hit-3-group" *ngIf="stage === 'hit3' || stage === 'lingering3'">
        <!-- Vertical Light Pillar Piercing Down -->
        <div class="vertical-light-pillar"></div>

        <!-- Huge Horizontal Shockwave Oval -->
        <div class="shockwave-oval-mega"></div>

        <!-- Implosion to Nova Ring -->
        <div class="nova-implosion-ring"></div>

        <!-- Giant X-Slash Blade 3A (-45deg) -->
        <div class="slash-blade-wrapper slash-3a" [class.is-lingering]="stage === 'lingering3'">
          <div class="blade-layer outer-glow mega-glow"></div>
          <div class="blade-layer energy-blade mega-blade"></div>
          <div class="blade-layer white-core mega-core"></div>
        </div>

        <!-- Giant X-Slash Blade 3B (+45deg) -->
        <div class="slash-blade-wrapper slash-3b" [class.is-lingering]="stage === 'lingering3'">
          <div class="blade-layer outer-glow mega-glow"></div>
          <div class="blade-layer energy-blade mega-blade"></div>
          <div class="blade-layer white-core mega-core"></div>
        </div>

        <!-- 18 Branching Lightning Sparks & Triangular Shards -->
        <div class="mega-climax-debris" *ngIf="stage === 'hit3'">
          <span class="shard sh1" style="--rot: 20deg; --dist: 130px;"></span>
          <span class="shard sh2" style="--rot: 75deg; --dist: 145px;"></span>
          <span class="shard sh3" style="--rot: 135deg; --dist: 120px;"></span>
          <span class="shard sh4" style="--rot: 195deg; --dist: 150px;"></span>
          <span class="shard sh5" style="--rot: 250deg; --dist: 135px;"></span>
          <span class="shard sh6" style="--rot: 310deg; --dist: 140px;"></span>
          <span class="shard sh7" style="--rot: 45deg; --dist: 160px;"></span>
          <span class="shard sh8" style="--rot: 225deg; --dist: 155px;"></span>
        </div>

        <!-- Local Impact Flash (Climax) -->
        <div class="local-impact-flash flash-3" *ngIf="stage === 'hit3'"></div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      width: 460px;
      height: 460px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 25;
    }

    .slash-impact-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .slash-impact-container.is-reverse {
      transform: scaleX(-1);
    }

    .hit-group {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ----------------------------------------------------------------- */
    /* SHARED BLADE LAYERS: 3 Layers for maximum punch                   */
    /* ----------------------------------------------------------------- */
    .slash-blade-wrapper {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .blade-layer {
      position: absolute;
      border-radius: 50% 50% 50% 50% / 80% 80% 20% 20%;
    }

    /* Outer Glow */
    .outer-glow {
      background: radial-gradient(ellipse at center, rgba(0, 240, 255, 0.9) 0%, rgba(2, 132, 199, 0.4) 60%, transparent 80%);
      filter: blur(8px) drop-shadow(0 0 18px #00f0ff);
      z-index: 1;
    }

    /* Energy Blade */
    .energy-blade {
      background: linear-gradient(90deg, transparent 0%, #00f0ff 15%, #38bdf8 50%, #00f0ff 85%, transparent 100%);
      clip-path: polygon(0% 50%, 15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%);
      filter: drop-shadow(0 0 10px #00f0ff);
      z-index: 2;
    }

    /* White-Hot Core */
    .white-core {
      background: linear-gradient(90deg, transparent 5%, #ffffff 25%, #ffffff 75%, transparent 95%);
      box-shadow: 0 0 8px #ffffff, 0 0 16px #00f0ff;
      border-radius: 4px;
      z-index: 3;
    }

    /* ----------------------------------------------------------------- */
    /* HIT 1 SPECIFICS: 300px Upward Diagonal Blade                      */
    /* ----------------------------------------------------------------- */
    .slash-1-diag {
      width: 320px;
      height: 28px;
      transform: rotate(-35deg) scaleX(0);
      animation: slash-1-anim var(--slash-duration, 280ms) cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
    }

    .slash-1-diag .outer-glow { width: 340px; height: 42px; }
    .slash-1-diag .energy-blade { width: 310px; height: 18px; }
    .slash-1-diag .white-core { width: 280px; height: 6px; }

    .blade-lightning-svg {
      position: absolute;
      width: 100%;
      height: 24px;
      z-index: 4;
    }

    .lightning-stroke {
      fill: none;
      stroke: #ffffff;
      stroke-width: 2;
      filter: drop-shadow(0 0 6px #00f0ff);
      stroke-dasharray: 40 10;
      animation: lightning-crawl 0.2s linear infinite;
    }

    @keyframes slash-1-anim {
      0% {
        transform: rotate(-35deg) scaleX(0.1) scaleY(0.5);
        opacity: 0;
      }
      35% {
        transform: rotate(-35deg) scaleX(1.15) scaleY(1.3);
        opacity: 1;
      }
      70% {
        transform: rotate(-35deg) scaleX(1) scaleY(1);
        opacity: 0.9;
      }
      100% {
        transform: rotate(-35deg) scaleX(1.05) scaleY(0.2);
        opacity: 0;
      }
    }

    .ring-1 {
      position: absolute;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      border: 2px solid #00f0ff;
      box-shadow: 0 0 12px #00f0ff, inset 0 0 8px #00f0ff;
      animation: shockwave-expand 0.26s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
    }

    @keyframes shockwave-expand {
      0% { transform: scale(0.3); opacity: 1; }
      100% { transform: scale(2.4); opacity: 0; }
    }

    .flash-1 {
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle, #ffffff 0%, rgba(0, 240, 255, 0.6) 45%, transparent 75%);
      animation: flash-fade 0.12s ease-out forwards;
    }

    @keyframes flash-fade {
      0% { opacity: 1; transform: scale(0.6); }
      100% { opacity: 0; transform: scale(1.4); }
    }

    /* ----------------------------------------------------------------- */
    /* HIT 2 SPECIFICS: Twin Reversing Cuts & Fork                       */
    /* ----------------------------------------------------------------- */
    .slash-2a {
      width: 320px;
      height: 30px;
      transform: rotate(40deg) scaleX(0);
      animation: slash-2a-anim var(--slash-duration, 300ms) cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
    }
    .slash-2a .outer-glow { width: 330px; height: 44px; }
    .slash-2a .energy-blade { width: 300px; height: 18px; }
    .slash-2a .white-core { width: 270px; height: 7px; }

    .slash-2b {
      width: 330px;
      height: 32px;
      transform: rotate(-25deg) scaleX(0);
      animation: slash-2b-anim var(--slash-duration, 300ms) 0.05s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
    }
    .slash-2b .outer-glow { width: 340px; height: 46px; }
    .slash-2b .energy-blade { width: 310px; height: 20px; }
    .slash-2b .white-core { width: 280px; height: 8px; }

    @keyframes slash-2a-anim {
      0% { transform: rotate(40deg) scaleX(0.1); opacity: 0; }
      35% { transform: rotate(40deg) scaleX(1.2); opacity: 1; }
      100% { transform: rotate(40deg) scaleX(1.05) scaleY(0.2); opacity: 0; }
    }

    @keyframes slash-2b-anim {
      0% { transform: rotate(-25deg) scaleX(0.1); opacity: 0; }
      35% { transform: rotate(-25deg) scaleX(1.25); opacity: 1; }
      100% { transform: rotate(-25deg) scaleX(1.05) scaleY(0.2); opacity: 0; }
    }

    .plasma-ring-spiral {
      position: absolute;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      border: 3px solid rgba(0, 240, 255, 0.85);
      border-top-color: #ffffff;
      border-left-color: rgba(56, 189, 248, 0.3);
      filter: drop-shadow(0 0 12px #00f0ff);
      animation: plasma-spin 0.32s ease-out forwards;
    }

    @keyframes plasma-spin {
      0% { transform: rotate(0deg) scale(0.4); opacity: 1; }
      100% { transform: rotate(380deg) scale(1.6); opacity: 0; }
    }

    .electric-fork-svg {
      position: absolute;
      width: 240px;
      height: 240px;
      z-index: 5;
    }

    .fork-stroke {
      fill: none;
      stroke: #00f0ff;
      filter: drop-shadow(0 0 8px #00f0ff);
      stroke-linecap: round;
    }

    .main-fork {
      stroke-width: 3;
      stroke: #ffffff;
      animation: fork-pop 0.28s ease-out forwards;
    }

    .sub-fork {
      stroke-width: 1.5;
      stroke: #38bdf8;
      animation: fork-pop 0.28s ease-out forwards;
    }

    @keyframes fork-pop {
      0% { opacity: 0; stroke-dasharray: 200; stroke-dashoffset: 200; }
      40% { opacity: 1; stroke-dashoffset: 0; }
      100% { opacity: 0; }
    }

    .flash-2 {
      position: absolute;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: radial-gradient(circle, #ffffff 0%, rgba(0, 240, 255, 0.7) 50%, transparent 75%);
      animation: flash-fade 0.15s ease-out forwards;
    }

    /* ----------------------------------------------------------------- */
    /* HIT 3: CLIMAX COLOSSAL X-SLASH (380-440px)                       */
    /* ----------------------------------------------------------------- */
    .slash-3a {
      width: 420px;
      height: 42px;
      transform: rotate(-45deg) scaleX(0);
      animation: slash-3-climax var(--slash3-duration, 450ms) cubic-bezier(0.12, 0.95, 0.15, 1) forwards;
    }
    .slash-3a .mega-glow { width: 440px; height: 60px; filter: blur(12px) drop-shadow(0 0 28px #00f0ff); }
    .slash-3a .mega-blade { width: 400px; height: 26px; }
    .slash-3a .mega-core { width: 370px; height: 10px; }

    .slash-3b {
      width: 420px;
      height: 42px;
      transform: rotate(45deg) scaleX(0);
      animation: slash-3-climax var(--slash3-duration, 450ms) cubic-bezier(0.12, 0.95, 0.15, 1) forwards;
    }
    .slash-3b .mega-glow { width: 440px; height: 60px; filter: blur(12px) drop-shadow(0 0 28px #00f0ff); }
    .slash-3b .mega-blade { width: 400px; height: 26px; }
    .slash-3b .mega-core { width: 370px; height: 10px; }

    @keyframes slash-3-climax {
      0% {
        transform: rotate(var(--rot, -45deg)) scaleX(0.1) scaleY(0.4);
        opacity: 0;
      }
      25% {
        transform: rotate(var(--rot, -45deg)) scaleX(1.3) scaleY(1.5);
        opacity: 1;
        filter: brightness(2);
      }
      60% {
        transform: rotate(var(--rot, -45deg)) scaleX(1) scaleY(1);
        opacity: 0.95;
      }
      100% {
        transform: rotate(var(--rot, -45deg)) scaleX(0.98) scaleY(0.7);
        opacity: 0.65;
      }
    }

    .slash-3a { --rot: -45deg; }
    .slash-3b { --rot: 45deg; }

    /* Lingering State (250-350ms hold) */
    .slash-blade-wrapper.is-lingering {
      animation: lingering-fade var(--impact-hold-duration, 300ms) ease-out forwards !important;
    }

    @keyframes lingering-fade {
      0% {
        opacity: 0.65;
        transform: rotate(var(--rot)) scale(1);
        filter: drop-shadow(0 0 16px #00f0ff);
      }
      100% {
        opacity: 0;
        transform: rotate(var(--rot)) scale(1.04);
        filter: drop-shadow(0 0 4px #00f0ff);
      }
    }

    /* Vertical Light Pillar */
    .vertical-light-pillar {
      position: absolute;
      width: 24px;
      height: 520px;
      top: -240px;
      background: linear-gradient(180deg, transparent 0%, rgba(0, 240, 255, 0.4) 20%, #ffffff 50%, rgba(0, 240, 255, 0.4) 80%, transparent 100%);
      box-shadow: 0 0 30px #00f0ff;
      animation: pillar-flash 0.35s ease-out forwards;
      z-index: 2;
    }

    @keyframes pillar-flash {
      0% { opacity: 0; transform: scaleX(0.3); }
      30% { opacity: 1; transform: scaleX(1.4); }
      100% { opacity: 0; transform: scaleX(0.1); }
    }

    /* Mega Shockwave Oval */
    .shockwave-oval-mega {
      position: absolute;
      width: 140px;
      height: 70px;
      border-radius: 50%;
      border: 3px solid #00f0ff;
      box-shadow: 0 0 20px #00f0ff, inset 0 0 15px #00f0ff;
      animation: oval-expand 0.38s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
    }

    @keyframes oval-expand {
      0% { transform: scale(0.2); opacity: 1; }
      100% { transform: scale(3.2); opacity: 0; }
    }

    /* Implosion Nova Ring */
    .nova-implosion-ring {
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 15px #00f0ff;
      animation: nova-implode 0.32s ease-in-out forwards;
    }

    @keyframes nova-implode {
      0% { transform: scale(2.2); opacity: 0; }
      30% { transform: scale(0.3); opacity: 1; border-width: 4px; }
      100% { transform: scale(2.8); opacity: 0; border-width: 1px; }
    }

    .flash-3 {
      position: absolute;
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: radial-gradient(circle, #ffffff 0%, rgba(0, 240, 255, 0.8) 45%, transparent 70%);
      animation: flash-fade 0.2s ease-out forwards;
    }

    /* ----------------------------------------------------------------- */
    /* PARTICLES & SHARDS                                               */
    /* ----------------------------------------------------------------- */
    .energy-particles {
      position: absolute;
      inset: 0;
    }

    .particle {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 8px #00f0ff;
      animation: particle-burst 0.32s ease-out forwards;
    }

    @keyframes particle-burst {
      0% { transform: translate(0, 0) scale(1.4); opacity: 1; }
      100% { transform: translate(var(--tx), var(--ty)) scale(0.2); opacity: 0; }
    }

    .mega-climax-debris {
      position: absolute;
      inset: 0;
    }

    .shard {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 14px solid #00f0ff;
      filter: drop-shadow(0 0 6px #00f0ff);
      animation: shard-fly 0.4s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
    }

    @keyframes shard-fly {
      0% {
        transform: translate(-50%, -50%) rotate(var(--rot)) scale(1.2);
        opacity: 1;
      }
      100% {
        transform: translate(calc(-50% + cos(var(--rot)) * var(--dist)), calc(-50% + sin(var(--rot)) * var(--dist))) rotate(calc(var(--rot) + 180deg)) scale(0.2);
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .slash-1-diag, .slash-2a, .slash-2b, .slash-3a, .slash-3b {
        animation-duration: 0.15s !important;
      }
      .particle, .shard, .vertical-light-pillar, .shockwave-oval-mega, .plasma-ring-spiral {
        display: none !important;
      }
    }
  `]
})
export class HaiSlashImpactVfxComponent {
  @Input() stage: HaiSlashStage = 'idle';
  @Input() isCrit = false;
  @Input() isReverse = false;
}
