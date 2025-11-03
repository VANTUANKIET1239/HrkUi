import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, forwardRef, Input, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

@Component({
  selector: 'hrk-input',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './hrk-input.component.html',
  styleUrls: ['./hrk-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HrkInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => HrkInputComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HrkInputComponent implements OnInit, ControlValueAccessor, Validator {


  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() hint?: string;
  @Input() name?: string;
  @Input() autocomplete?: string;
  @Input() invalid: boolean = false;

  // Behavior/validation inputs
  @Input() type: 'text' | 'password' | 'email' | 'number' = 'text';
  @Input() required = false;
  @Input() minlength?: number;
  @Input() maxlength?: number;

  // Internal state via signals (Angular 16+)
  value = signal<string | null>(null);
  disabled = false;
  touched = signal(false);
  errors: ValidationErrors | null = null;


  ngOnInit() {
  }


  // ControlValueAccessor hooks
  private onChange: (val: any) => void = () => {};
  onTouched: () => void = () => { this.touched.set(true); };

  constructor() {
    // Re-evaluate error visibility on value change
    effect(() => {
      void this.value();
      // No-op: template reads showErrors() which checks this.errors & touched state
    });
  }

  writeValue(val: any): void {
    this.value.set(val ?? null);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Validator
  validate(_: AbstractControl): ValidationErrors | null {
    const v = this.value() ?? '';

    const errs: ValidationErrors = {};
    if (this.required && v.trim().length === 0) errs['required'] = true;
    if (this.minlength != null && v.length < this.minlength) errs['minlength'] = { requiredLength: this.minlength, actualLength: v.length };
    if (this.maxlength != null && v.length > this.maxlength) errs['maxlength'] = { requiredLength: this.maxlength, actualLength: v.length };

    this.errors = Object.keys(errs).length ? errs : null;
    return this.errors;
  }

  // UI handlers
  handleInput(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const next = input.value;
    this.value.set(next);
    this.onChange(next);
  }

  showErrors(): boolean {
    return !!this.errors && (this.touched() || this.disabled === false);
  }
}
