import { CommonModule } from '@angular/common';
import { Component, Input, input, OnInit } from '@angular/core';
import { HrkImageDirective } from '../hrk-image/hrk-image.directive';

@Component({
  selector: 'hrk-icon',
  standalone: true,
  imports: [CommonModule, HrkImageDirective],
  templateUrl: './hrk-icon.component.html',
  styleUrls: ['./hrk-icon.component.scss']
})
export class HrkIconComponent implements OnInit {

  @Input() biIconName: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'small';
  @Input() color: string = 'black';
  @Input() useSvg: boolean = false;
  @Input() svgIconName: string = '';
  private baseSvgPath: string = 'assets/svgs/';
  constructor() { }

  ngOnInit() {
  }

  getSvgPath(iconName: string): string {
    return `${this.baseSvgPath}${iconName}.svg`;
  }


  getFontSize(size: 'small' | 'medium' | 'large'): string {
    switch (size) {
      case 'small':
        return '16px';
      case 'medium':
        return '24px';
      case 'large':
        return '32px';
      default:
        return '16px';
    }
  }
}
