import { CommonModule } from '@angular/common';
import { Component, forwardRef, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'hrk-checkbox',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './hrk-checkbox.component.html',
  styleUrls: ['./hrk-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HrkCheckboxComponent),
      multi: true
    }
  ]
})
export class HrkCheckboxComponent implements OnInit, ControlValueAccessor {


  @Input() backgroundColor: string = '';


 // Internal state of the checkbox
  value: boolean = false;
  disabled: boolean = false;



  ngOnInit(): void {

  }

  onChange = (value: boolean) => {};
  onTouched = () => {};


  @HostBinding('class.disabled')
  get isDisabled() {
    return this.disabled ? true : null;
  }

  @HostBinding('attr.aria-checked')
  get isChecked() {
    return this.value;
  }

  @HostBinding('attr.tabindex')
  get tabindex() {
    return this.disabled ? -1 : 0;
  }


  writeValue(value: any): void {
    this.value = !!value; // Coerce to boolean
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private toggleValue(): void {
    if (this.disabled) {
      return;
    }
    this.value = !this.value;

    this.onChange(this.value);

    this.onTouched();
  }


  @HostListener('click')
  onClick() {
    this.toggleValue();
  }

  @HostListener('keydown.space', ['$event'])
  onKeydown(event: Event) {
    event.preventDefault(); // Prevent page scrolling
    this.toggleValue();
  }
}
