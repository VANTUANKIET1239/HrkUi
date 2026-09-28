import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AuraParticleDescriptor {
  id: number;
  type: 'dust' | 'spark';
  minTier: number;
  x: string;
  y: string;
  size: number;
  duration: string;
  delay: string;
  opacity: number;
  driftX: string;
  color: string;
}

@Component({
  selector: 'app-thanh-thai-aura-resource',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thanh-thai-aura.component.html',
  styleUrl: './thanh-thai-aura.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThanhThaiAuraComponent implements OnChanges {
  @Input() currentAura = 0;
  @Input() maxAura = 100;
  @Input() auraTier = 0;
  @Input() isFullAura = false;
  @Input() visualSpeed = 1;
  @Input() team: 'left' | 'right' = 'left';
  @Input() facing: 'left' | 'right' = 'right';

  activationBurst = false;
  private previousAura = 0;
  private hasActivatedFullAura = false;

  // Stable 20 particle descriptors with varied coordinates, sizes, delays and drift
  // Prevents any runtime garbage collection or re-instantiation in change detection
  readonly particles: AuraParticleDescriptor[] = [
    // --- Dark Dust (8 items) ---
    { id: 1, type: 'dust', minTier: 1, x: '24%', y: '8%', size: 4.5, duration: '3.6s', delay: '0s', opacity: 0.38, driftX: '-10px', color: '#681322' },
    { id: 2, type: 'dust', minTier: 1, x: '72%', y: '12%', size: 5.5, duration: '4.2s', delay: '0.8s', opacity: 0.32, driftX: '14px', color: '#520d1a' },
    { id: 3, type: 'dust', minTier: 1, x: '45%', y: '6%', size: 4.0, duration: '3.8s', delay: '1.5s', opacity: 0.40, driftX: '-8px', color: '#681322' },
    { id: 4, type: 'dust', minTier: 2, x: '35%', y: '14%', size: 6.0, duration: '4.5s', delay: '0.4s', opacity: 0.35, driftX: '12px', color: '#450a14' },
    { id: 5, type: 'dust', minTier: 2, x: '62%', y: '10%', size: 5.0, duration: '3.9s', delay: '1.9s', opacity: 0.30, driftX: '-14px', color: '#5a0f1d' },
    { id: 6, type: 'dust', minTier: 3, x: '18%', y: '18%', size: 4.5, duration: '4.0s', delay: '1.1s', opacity: 0.42, driftX: '16px', color: '#681322' },
    { id: 7, type: 'dust', minTier: 3, x: '80%', y: '16%', size: 6.5, duration: '4.6s', delay: '2.3s', opacity: 0.35, driftX: '-15px', color: '#4a0c16' },
    { id: 8, type: 'dust', minTier: 4, x: '50%', y: '12%', size: 7.0, duration: '4.8s', delay: '2.7s', opacity: 0.48, driftX: '10px', color: '#7a1728' },

    // --- Glowing Embers / Sparks (12 items) ---
    { id: 9, type: 'spark', minTier: 1, x: '28%', y: '16%', size: 2.5, duration: '2.2s', delay: '0.2s', opacity: 0.85, driftX: '16px', color: '#ff8a95' },
    { id: 10, type: 'spark', minTier: 1, x: '68%', y: '20%', size: 3.0, duration: '2.5s', delay: '0.9s', opacity: 0.90, driftX: '-18px', color: '#ff334f' },
    { id: 11, type: 'spark', minTier: 2, x: '42%', y: '10%', size: 3.5, duration: '1.9s', delay: '0.5s', opacity: 0.95, driftX: '20px', color: '#fff1f2' },
    { id: 12, type: 'spark', minTier: 2, x: '58%', y: '14%', size: 2.5, duration: '2.4s', delay: '1.3s', opacity: 0.85, driftX: '-12px', color: '#ff334f' },
    { id: 13, type: 'spark', minTier: 2, x: '22%', y: '22%', size: 3.0, duration: '2.1s', delay: '1.7s', opacity: 0.90, driftX: '22px', color: '#ff8a95' },
    { id: 14, type: 'spark', minTier: 3, x: '75%', y: '26%', size: 3.5, duration: '1.8s', delay: '0.3s', opacity: 0.95, driftX: '-24px', color: '#fff1f2' },
    { id: 15, type: 'spark', minTier: 3, x: '32%', y: '28%', size: 4.0, duration: '2.3s', delay: '1.0s', opacity: 0.88, driftX: '18px', color: '#ff334f' },
    { id: 16, type: 'spark', minTier: 3, x: '65%', y: '32%', size: 2.5, duration: '2.0s', delay: '1.6s', opacity: 0.92, driftX: '-20px', color: '#ff8a95' },
    { id: 17, type: 'spark', minTier: 4, x: '48%', y: '18%', size: 4.5, duration: '1.7s', delay: '0.1s', opacity: 1.00, driftX: '28px', color: '#ffffff' },
    { id: 18, type: 'spark', minTier: 4, x: '15%', y: '26%', size: 3.5, duration: '2.1s', delay: '0.7s', opacity: 0.95, driftX: '24px', color: '#ff334f' },
    { id: 19, type: 'spark', minTier: 4, x: '85%', y: '24%', size: 3.0, duration: '1.9s', delay: '1.4s', opacity: 0.95, driftX: '-26px', color: '#fff1f2' },
    { id: 20, type: 'spark', minTier: 4, x: '52%', y: '36%', size: 4.0, duration: '2.2s', delay: '2.0s', opacity: 1.00, driftX: '-18px', color: '#ff8a95' }
  ];

  get effectiveTier(): number {
    if (this.isFullAura || this.currentAura >= 100 || this.auraTier >= 4) return 4;
    if (this.currentAura >= 75 || this.auraTier >= 3) return 3;
    if (this.currentAura >= 50 || this.auraTier >= 2) return 2;
    if (this.currentAura >= 25 || this.auraTier >= 1) return 1;
    return 0;
  }

  get visibleParticles(): AuraParticleDescriptor[] {
    const tier = this.effectiveTier;
    if (tier === 0) return [];
    return this.particles.filter(p => p.minTier <= tier);
  }

  trackParticleById(_index: number, item: AuraParticleDescriptor): number {
    return item.id;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentAura'] || changes['isFullAura'] || changes['auraTier']) {
      const prev = changes['currentAura'] ? changes['currentAura'].previousValue ?? 0 : this.previousAura;
      const curr = this.currentAura;

      if ((curr >= 100 || this.isFullAura || this.auraTier >= 4) && prev < 100 && !this.hasActivatedFullAura) {
        this.hasActivatedFullAura = true;
        this.triggerFullAuraActivation();
      } else if (curr < 100 && !this.isFullAura && this.auraTier < 4) {
        this.hasActivatedFullAura = false;
        this.activationBurst = false;
      }
      this.previousAura = curr;
    }
  }

  private triggerFullAuraActivation(): void {
    this.activationBurst = true;
    const cappedSpeed = Math.max(0.5, Math.min(1.8, this.visualSpeed));
    setTimeout(() => {
      this.activationBurst = false;
    }, 1100 / cappedSpeed);
  }
}
