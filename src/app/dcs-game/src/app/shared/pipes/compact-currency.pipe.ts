import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'compactCurrency', standalone: true })
export class CompactCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '0';
    if (Math.abs(value) < 10000) return value.toLocaleString('vi-VN');
    const van = value / 10000;
    return `${Number.isInteger(van) ? van : van.toFixed(1)} Vạn`;
  }
}
