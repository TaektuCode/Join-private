import { Component } from '@angular/core';
import { SummaryComponent } from './summary/summary.component';

@Component({
  selector: 'app-maincontent',
  standalone: true,
  imports: [SummaryComponent],
  templateUrl: './maincontent.component.html',
  styleUrl: './maincontent.component.scss',
})
export class MaincontentComponent {}
