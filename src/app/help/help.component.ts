import { Component } from '@angular/core';
import { Location } from '@angular/common';

/**
 * A component that displays help information.
 */
@Component({
  selector: 'app-help',
  standalone: true,
  imports: [],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {
  /**
   * Creates an instance of HelpComponent.
   * @param location The Angular Location service for interacting with the browser's history.
   */
  constructor(private location: Location) { }

  /**
   * Navigates the user back to the previous page in the browser's history.
   */
  backPage() {
    this.location.back();
  }
}