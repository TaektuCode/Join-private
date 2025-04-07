import { Component } from '@angular/core';
import { SummaryComponent } from './summary/summary.component';

/**
 * Component that serves as the main content area of the application.
 * Currently, it includes the SummaryComponent.
 */
@Component({
  selector: 'app-maincontent',
  standalone: true,
  imports: [SummaryComponent],
  templateUrl: './maincontent.component.html',
  styleUrl: './maincontent.component.scss',
})
export class MaincontentComponent {}