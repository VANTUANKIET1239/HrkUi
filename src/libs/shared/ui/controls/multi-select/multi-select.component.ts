import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { HrkCheckboxComponent } from "../hrk-checkbox/hrk-checkbox.component";

export interface MultiSelectItem {
  label: string;
  value: any;
  selected?: boolean;
}

@Component({
  selector: 'hrk-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  standalone: true,
  imports: [FormsModule, HrkCheckboxComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true
    }
  ]
})
export class MultiSelectComponent implements ControlValueAccessor {
  @Input() items: MultiSelectItem[] = [];
  @Input() placeholder = 'Select...';
  @Input() searchable = true;

  @Output() selectionChange = new EventEmitter<any[]>();

  opened = false;
  searchText = '';
  selectedValues: any[] = [];

  private onChange = (_: any) => {};
  private onTouched = () => {};

  toggleDropdown() {
    this.opened = !this.opened;
  }

  isSelected(value: any): boolean {
    return this.selectedValues.includes(value);
  }

  toggleItem(value: any) {
    if (this.isSelected(value)) {
      this.selectedValues = this.selectedValues.filter(v => v !== value);
    } else {
      this.selectedValues = [...this.selectedValues, value];
    }

    this.onChange(this.selectedValues);
    this.selectionChange.emit(this.selectedValues);
  }

  get filteredItems(): MultiSelectItem[] {
    this.items.forEach(item => {
      item.selected = this.isSelected(item.value);
    });
    if (!this.searchText) return this.items;
    return this.items.filter(i =>
      i.label.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  writeValue(value: any[]): void {
    this.selectedValues = value || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
