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
  selector: 'app-skill-hai-last-laugh',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-hai-last-laugh.component.html',
  styleUrl: './skill-hai-last-laugh.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillHaiLastLaughComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isTeamRight = false;
  @Input() character?: Hero | null;
  @Input() phase: string = 'idle';
  @Input() visualSpeed = 1;
  @Input() castSequence?: number | null = null;

  quoteState: 'quote1' | 'quote2' | 'hidden' = 'quote1';
  isDashingOut = false;
  isReappearing = false;

  private timeouts: any[] = [];
  private lastExecutedCastSeq: number | null = null;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startPrepSequence();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const seqChanged = this.castSequence != null && this.castSequence !== this.lastExecutedCastSeq;
    if (seqChanged || changes['castSequence']) {
      this.lastExecutedCastSeq = this.castSequence ?? null;
      this.startPrepSequence();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private startPrepSequence(): void {
    this.clearTimers();

    const speed = Math.max(1, this.visualSpeed);
    const quote1Duration = Math.max(150, Math.round(240 / speed));
    const quote2Duration = Math.max(250, Math.round(450 / speed));
    const dashStartTime = Math.max(500, Math.round(800 / speed));
    const returnTime = Math.max(1500, Math.round(2400 / speed));

    this.quoteState = 'quote1';
    this.isDashingOut = false;
    this.isReappearing = false;
    this.cdr.markForCheck();

    // 1. Quote phase 2: "Vì sắp hết lượt rồi."
    const t1 = setTimeout(() => {
      this.quoteState = 'quote2';
      this.cdr.markForCheck();
    }, quote1Duration);
    this.timeouts.push(t1);

    // 2. Hide quote completely before dash/hit 1
    const t2 = setTimeout(() => {
      this.quoteState = 'hidden';
      this.cdr.markForCheck();
    }, quote1Duration + quote2Duration);
    this.timeouts.push(t2);

    // 3. Caster dashes out towards target (disappears from origin)
    const t3 = setTimeout(() => {
      this.isDashingOut = true;
      this.cdr.markForCheck();
    }, dashStartTime);
    this.timeouts.push(t3);

    // 4. Return phase: Reappear at origin with knife sheathing
    const t4 = setTimeout(() => {
      this.isDashingOut = false;
      this.isReappearing = true;
      this.cdr.markForCheck();
    }, returnTime);
    this.timeouts.push(t4);

    // 5. Settle after reappearance
    const t5 = setTimeout(() => {
      this.isReappearing = false;
      this.cdr.markForCheck();
    }, returnTime + 450);
    this.timeouts.push(t5);
  }

  private clearTimers(): void {
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
  }
}
