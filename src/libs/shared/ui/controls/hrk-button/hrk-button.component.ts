import { CommonModule } from '@angular/common';
import { Component, Input, input, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'hrk-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hrk-button.component.html',
  styleUrls: ['./hrk-button.component.scss']
})
export class HrkButtonComponent implements OnInit{

  @Input() loading = false;
  @Input() buttonName = '';
  @Input() style: { backgroundColor?: string, color?: string } = {
    backgroundColor: '#007bff',
    color: '#ffffff',
  }
  @Input() ngClasses:string = '';
  constructor() { }

  ngOnInit() {
  }


}
