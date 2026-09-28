import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hai-target-lock-vfx',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="target-lock-root" [class.is-locked]="isLocked" [class.is-snapping]="isSnapping">
      <!-- Outer Concentric Rotating Ring (Clockwise) -->
      <div class="lock-ring ring-outer">
        <svg viewBox="0 0 120 120" class="ring-svg">
          <circle cx="60" cy="60" r="52" class="outer-track" />
          <circle cx="60" cy="60" r="52" class="outer-dash" />
        </svg>
      </div>

      <!-- Middle Concentric Rotating Ring (Counter-Clockwise) -->
      <div class="lock-ring ring-mid">
        <svg viewBox="0 0 90 90" class="ring-svg">
          <circle cx="45" cy="45" r="38" class="mid-track" />
          <circle cx="45" cy="45" r="38" class="mid-ticks" />
        </svg>
      </div>

      <!-- Inner Pulsing Tech Ring -->
      <div class="lock-ring ring-inner">
        <div class="inner-circle"></div>
      </div>

      <!-- 4 Cardinal Directional Crosshair Brackets -->
      <div class="bracket bracket-top"></div>
      <div class="bracket bracket-bottom"></div>
      <div class="bracket bracket-left"></div>
      <div class="bracket bracket-right"></div>

      <!-- Sweeping Laser Scan Line -->
      <div class="laser-scanner">
        <div class="laser-beam"></div>
      </div>

      <!-- Central Cyber X-Marker -->
      <div class="center-marker">
        <span class="cross-line cross-1"></span>
        <span class="cross-line cross-2"></span>
        <span class="target-dot"></span>
      </div>

      <!-- Converging Electric Particle Arcs -->
      <div class="converging-sparks">
        <span class="spark sp-1"></span>
        <span class="spark sp-2"></span>
        <span class="spark sp-3"></span>
        <span class="spark sp-4"></span>
      </div>

      <!-- Holographic Status Tag -->
      <div class="lock-tag">LOCK-ON</div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      width: 140px;
      height: 140px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 22;
    }

    .target-lock-root {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(1.35);
      animation: lock-appear 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .target-lock-root.is-snapping {
      animation: lock-snap-in 0.16s cubic-bezier(0.7, 0, 0.84, 0) forwards;
    }

    @keyframes lock-appear {
      0% {
        opacity: 0;
        transform: scale(1.5) rotate(-20deg);
      }
      100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }
    }

    @keyframes lock-snap-in {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      80% {
        opacity: 1;
        transform: scale(0.25);
        filter: brightness(2.5) drop-shadow(0 0 20px #00f0ff);
      }
      100% {
        opacity: 0;
        transform: scale(0.05);
      }
    }

    .lock-ring {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ring-svg {
      width: 100%;
      height: 100%;
    }

    /* Outer Ring */
    .ring-outer {
      animation: spin-clockwise 6s linear infinite;
    }

    .outer-track {
      fill: none;
      stroke: rgba(6, 182, 212, 0.25);
      stroke-width: 1.5;
    }

    .outer-dash {
      fill: none;
      stroke: #00f0ff;
      stroke-width: 2.5;
      stroke-dasharray: 24 16 8 16;
      filter: drop-shadow(0 0 6px #00f0ff);
    }

    /* Middle Ring */
    .ring-mid {
      width: 104px;
      height: 104px;
      margin: auto;
      animation: spin-counter 4s linear infinite;
    }

    .mid-track {
      fill: none;
      stroke: rgba(56, 189, 248, 0.3);
      stroke-width: 1;
    }

    .mid-ticks {
      fill: none;
      stroke: #38bdf8;
      stroke-width: 2;
      stroke-dasharray: 6 14;
      filter: drop-shadow(0 0 4px #38bdf8);
    }

    /* Inner Ring */
    .ring-inner {
      width: 56px;
      height: 56px;
      margin: auto;
    }

    .inner-circle {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 1.5px solid rgba(34, 211, 238, 0.7);
      background: radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, transparent 70%);
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.4), inset 0 0 8px rgba(0, 240, 255, 0.3);
      animation: inner-pulse 1.2s ease-in-out infinite alternate;
    }

    @keyframes inner-pulse {
      0% { transform: scale(0.9); opacity: 0.6; }
      100% { transform: scale(1.08); opacity: 1; }
    }

    @keyframes spin-clockwise {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes spin-counter {
      from { transform: rotate(360deg); }
      to { transform: rotate(0deg); }
    }

    /* 4 Cardinal Brackets */
    .bracket {
      position: absolute;
      background: #00f0ff;
      filter: drop-shadow(0 0 5px #00f0ff);
    }

    .bracket-top {
      top: 6px;
      left: 50%;
      width: 3px;
      height: 14px;
      transform: translateX(-50%);
    }

    .bracket-bottom {
      bottom: 6px;
      left: 50%;
      width: 3px;
      height: 14px;
      transform: translateX(-50%);
    }

    .bracket-left {
      left: 6px;
      top: 50%;
      width: 14px;
      height: 3px;
      transform: translateY(-50%);
    }

    .bracket-right {
      right: 6px;
      top: 50%;
      width: 14px;
      height: 3px;
      transform: translateY(-50%);
    }

    /* Sweeping Laser Scan */
    .laser-scanner {
      position: absolute;
      inset: 12px;
      overflow: hidden;
      border-radius: 50%;
    }

    .laser-beam {
      position: absolute;
      top: 0;
      left: -20%;
      width: 140%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00f0ff, #ffffff, #00f0ff, transparent);
      box-shadow: 0 0 8px #00f0ff;
      animation: laser-sweep 1.2s ease-in-out infinite;
    }

    @keyframes laser-sweep {
      0% { top: 0%; opacity: 0; }
      20% { opacity: 1; }
      80% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }

    /* Center Cyber X */
    .center-marker {
      position: absolute;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cross-line {
      position: absolute;
      background: rgba(255, 255, 255, 0.85);
      border-radius: 1px;
      box-shadow: 0 0 4px #00f0ff;
    }

    .cross-1 {
      width: 14px;
      height: 2px;
      transform: rotate(45deg);
    }

    .cross-2 {
      width: 14px;
      height: 2px;
      transform: rotate(-45deg);
    }

    .target-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 6px #00f0ff;
    }

    /* Converging Sparks */
    .converging-sparks {
      position: absolute;
      inset: 0;
    }

    .spark {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 6px #00f0ff;
    }

    .sp-1 { top: 20px; left: 24px; animation: conv-1 0.7s infinite ease-in; }
    .sp-2 { top: 22px; right: 26px; animation: conv-2 0.75s infinite ease-in; }
    .sp-3 { bottom: 24px; left: 22px; animation: conv-3 0.65s infinite ease-in; }
    .sp-4 { bottom: 20px; right: 24px; animation: conv-4 0.72s infinite ease-in; }

    @keyframes conv-1 {
      0% { transform: translate(0, 0); opacity: 0.8; }
      100% { transform: translate(45px, 45px); opacity: 0; }
    }
    @keyframes conv-2 {
      0% { transform: translate(0, 0); opacity: 0.8; }
      100% { transform: translate(-45px, 45px); opacity: 0; }
    }
    @keyframes conv-3 {
      0% { transform: translate(0, 0); opacity: 0.8; }
      100% { transform: translate(45px, -45px); opacity: 0; }
    }
    @keyframes conv-4 {
      0% { transform: translate(0, 0); opacity: 0.8; }
      100% { transform: translate(-45px, -45px); opacity: 0; }
    }

    /* Holographic Tag */
    .lock-tag {
      position: absolute;
      bottom: -22px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #00f0ff;
      text-shadow: 0 0 6px #00f0ff;
      background: rgba(2, 6, 23, 0.75);
      border: 1px solid rgba(0, 240, 255, 0.4);
      padding: 1px 6px;
      border-radius: 3px;
    }

    @media (prefers-reduced-motion: reduce) {
      .ring-outer, .ring-mid, .inner-circle, .laser-beam, .spark {
        animation: none !important;
      }
      .target-lock-root {
        animation: none !important;
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class HaiTargetLockVfxComponent {
  @Input() isLocked = true;
  @Input() isSnapping = false;
}
