import { Pipe, PipeTransform } from '@angular/core';

/**
 * A pipe that truncates a string if it exceeds a specified maximum length, adding an ellipsis (...) to the end.
 */
@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  /**
   * Transforms a string value by truncating it if it's longer than the specified maxLength.
   * @param value The string to truncate, or null/undefined.
   * @param maxLength The maximum length of the string before truncation.
   * @returns The truncated string with an ellipsis if it was longer than maxLength, otherwise the original string. Returns null or undefined if the input value was null or undefined.
   */
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