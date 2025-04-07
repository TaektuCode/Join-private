import { Component } from '@angular/core';
import { Location } from '@angular/common';

/**
 * Component displaying the privacy policy and providing a button to navigate back.
 */
@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [],
  templateUrl: './policy.component.html',
  styleUrl: './policy.component.scss'
})
export class PolicyComponent {
  /**
   * Injects the Location service to handle navigation.
   * @param location The Location service.
   */
  constructor(private location: Location) { }

  /**
   * Navigates the user back to the previous page in the browser history.
   */
  backPage() {
    this.location.back();
  }
}