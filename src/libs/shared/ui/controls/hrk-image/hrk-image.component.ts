import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { HrkImageDirective } from './hrk-image.directive';

@Component({
  selector: 'hrk-image',
  standalone: true,
  templateUrl: './hrk-image.component.html',
  styleUrls: ['./hrk-image.component.scss'],
  imports: [CommonModule, HrkImageDirective]
})
export class HrkImageComponent implements OnInit {


  private baseImagePath: string = 'assets/images/';
  @Input() imageName: string = '';
  @Input() isBordered: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  getImagePath(): string {
    return `${this.baseImagePath}${this.imageName}`;
  }
}
