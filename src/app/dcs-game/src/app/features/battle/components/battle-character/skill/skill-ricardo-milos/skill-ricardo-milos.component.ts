import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DebrisPiece {
  x: string;
  y: string;
  rotation: string;
  delay: string;
  size: string;
}

@Component({
  selector: 'app-skill-ricardo-milos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-ricardo-milos.component.html',
  styleUrl: './skill-ricardo-milos.component.scss'
})
export class SkillRicardoMilosComponent {
  @Input() isTeamRight = false;
  @Input() empowered = false;
  @Input() phase: string = 'idle';
  @Input() visualSpeed = 1;
  @Input() castSequence?: number | null = null;

  readonly debrisPieces: DebrisPiece[] = [
    { x: '-130px', y: '-140px', rotation: '380deg', delay: '0.00s', size: '14px' },
    { x: '-95px',  y: '-190px', rotation: '-290deg', delay: '0.03s', size: '10px' },
    { x: '-60px',  y: '-160px', rotation: '450deg', delay: '0.01s', size: '16px' },
    { x: '-30px',  y: '-210px', rotation: '-360deg', delay: '0.05s', size: '8px'  },
    { x: '10px',   y: '-230px', rotation: '520deg', delay: '0.02s', size: '12px' },
    { x: '45px',   y: '-180px', rotation: '-420deg', delay: '0.04s', size: '18px' },
    { x: '80px',   y: '-200px', rotation: '310deg', delay: '0.01s', size: '9px'  },
    { x: '120px',  y: '-150px', rotation: '-540deg', delay: '0.06s', size: '15px' },
    { x: '145px',  y: '-110px', rotation: '270deg', delay: '0.02s', size: '11px' },
    { x: '-110px', y: '-80px',  rotation: '-180deg', delay: '0.07s', size: '13px' },
    { x: '-40px',  y: '-120px', rotation: '390deg', delay: '0.04s', size: '7px'  },
    { x: '60px',   y: '-100px', rotation: '-330deg', delay: '0.03s', size: '12px' },
    { x: '-15px',  y: '-170px', rotation: '480deg', delay: '0.05s', size: '14px' },
    { x: '100px',  y: '-90px',  rotation: '-250deg', delay: '0.02s', size: '8px'  }
  ];
}
