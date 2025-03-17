import { Component } from '@angular/core';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent {
  message: string = '';

  constructor() {
    this.checkTime();
  }

  checkTime(): void {
    const date = new Date();
    const hours = date.getHours();

    this.message =
      hours >= 6 && hours < 11 ? 'Good Morning' :
        hours >= 11 && hours < 15 ? 'Good Afternoon' :
          hours >= 15 && hours < 22 ? 'Good Evening' :
            'Good Night';
  }
}
