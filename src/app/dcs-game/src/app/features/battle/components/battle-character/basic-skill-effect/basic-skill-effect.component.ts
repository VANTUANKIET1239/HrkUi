import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../../../../core/models/hero.model';
import { BasicEffectCode, resolveBasicEffectCode } from './basic-effect-resolver.util';
import { KietBasicComponent } from './kiet-basic/kiet-basic.component';
import { NamDeadlineBasicComponent } from './nam-deadline-basic/nam-deadline-basic.component';
import { ChuanMenBasicComponent } from './chuan-men-basic/chuan-men-basic.component';
import { CoderBanhBasicComponent } from './coder-banh-basic/coder-banh-basic.component';
import { TesterDepBasicComponent } from './tester-dep-basic/tester-dep-basic.component';
import { TuongLongBasicComponent } from './tuong-long-basic/tuong-long-basic.component';
import { PmHoiHaBasicComponent } from './pm-hoi-ha-basic/pm-hoi-ha-basic.component';
import { QaKyTinhBasicComponent } from './qa-ky-tinh-basic/qa-ky-tinh-basic.component';
import { KietNoelHealComponent } from './kiet-noel-heal/kiet-noel-heal.component';
import { HoangNguyenBasicComponent } from './hoang-nguyen-basic/hoang-nguyen-basic.component';
import { HaiLastSmileBasicComponent } from './hai-last-smile-basic/hai-last-smile-basic.component';

@Component({
  selector: 'app-basic-skill-effect',
  standalone: true,
  imports: [
    CommonModule,
    KietBasicComponent,
    NamDeadlineBasicComponent,
    ChuanMenBasicComponent,
    CoderBanhBasicComponent,
    TesterDepBasicComponent,
    TuongLongBasicComponent,
    PmHoiHaBasicComponent,
    QaKyTinhBasicComponent,
    KietNoelHealComponent,
    HoangNguyenBasicComponent,
    HaiLastSmileBasicComponent
  ],
  templateUrl: './basic-skill-effect.component.html',
  styleUrl: './basic-skill-effect.component.scss'
})
export class BasicSkillEffectComponent {
  @Input({ required: true }) character!: Hero;
  @Input() activeSkillId: string | null = null;
  @Input() phase: 'cast' | 'impact' = 'cast';
  @Input() isTeamRight = false;

  get effectCode(): BasicEffectCode {
    return resolveBasicEffectCode(this.character, this.activeSkillId);
  }
}
