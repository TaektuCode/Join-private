import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    maxLength: number
  ): string | null | undefined {
    if (value === null || value === undefined) {
      return value;
    }
    if (value.length > maxLength) {
      return value.substring(0, maxLength - 3) + '...';
    } else {
      return value;
    }
  }
}
