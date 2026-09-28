import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../../../core/models/hero.model';

@Component({
  selector: 'app-skill-nghia-phuc-prime',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-nghia-phuc-prime.component.html',
  styleUrl: './skill-nghia-phuc-prime.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillNghiaPhucPrimeComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isTeamRight = false;
  @Input() phase: string = 'idle';
  @Input() visualSpeed = 1;
  @Input() castSequence?: number | null = null;
  @Input() activeSkillId: string | null = null;
  @Input() character!: Hero;

  // Basic attack animation state
  isChargingShield = false;
  isBashing = false;
  isSendingShieldBeam = false;
  hasMaxFortitude = false;

  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private lastExecutedSeq: number | null = null;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateStatusVisuals();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateStatusVisuals();

    const seqChanged = this.castSequence != null && this.castSequence !== this.lastExecutedSeq;
    if (this.isBasic && (seqChanged || changes['phase'] || changes['activeSkillId'])) {
      this.lastExecutedSeq = this.castSequence ?? null;
      this.runBasicSkillSequence();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  get isBasic(): boolean {
    return this.activeSkillId === 'PRIME_SHIELD_WARRANTY';
  }

  get isUltimate(): boolean {
    return this.activeSkillId === 'PRIME_FORTRESS_CHARGE';
  }

  get fortitudeStacks(): number {
    const status = this.character?.battleStatuses?.find(s => s.code === 'PRIME_FORTITUDE');
    return status?.stacks || 0;
  }

  get pressureStacks(): number {
    const status = this.character?.battleStatuses?.find(s => s.code === 'PRIME_PRESSURE');
    return status?.stacks || 0;
  }

  get hasGuardian(): boolean {
    return (this.character?.battleStatuses?.some(s => s.code === 'PRIME_GUARDIAN') ||
      this.character?.statusEffects?.includes('PRIME_GUARDIAN')) ?? false;
  }

  private updateStatusVisuals(): void {
    this.hasMaxFortitude = this.fortitudeStacks >= 4;
  }

  private runBasicSkillSequence(): void {
    this.clearTimers();

    const speed = Math.max(0.5, this.visualSpeed);
    const chargeDuration = Math.max(120, Math.round(250 / speed));
    const bashDuration = Math.max(180, Math.round(350 / speed));
    const beamDuration = Math.max(200, Math.round(400 / speed));

    // Phase 1: Energy lines charging on shield
    this.isChargingShield = true;
    this.isBashing = false;
    this.isSendingShieldBeam = false;
    this.cdr.markForCheck();

    // Phase 2: Forward heavy shield bash
    const t1 = setTimeout(() => {
      this.isChargingShield = false;
      this.isBashing = true;
      this.cdr.markForCheck();
    }, chargeDuration);
    this.timeouts.push(t1);

    // Phase 3: Energy beam flies to lowest HP ally
    const t2 = setTimeout(() => {
      this.isBashing = false;
      this.isSendingShieldBeam = true;
      this.cdr.markForCheck();
    }, chargeDuration + bashDuration);
    this.timeouts.push(t2);

    // End sequence
    const t3 = setTimeout(() => {
      this.isSendingShieldBeam = false;
      this.cdr.markForCheck();
    }, chargeDuration + bashDuration + beamDuration);
    this.timeouts.push(t3);
  }

  private clearTimers(): void {
    for (const t of this.timeouts) {
      clearTimeout(t);
    }
    this.timeouts = [];
  }
}
