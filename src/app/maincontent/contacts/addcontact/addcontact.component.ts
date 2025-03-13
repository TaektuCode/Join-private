import { Component } from '@angular/core';

@Component({
  selector: 'app-addcontact',
  standalone: true,
  imports: [],
  templateUrl: './addcontact.component.html',
  styleUrl: './addcontact.component.scss',
})
export class AddcontactComponent {
  showOverlay = false;

  openOverlay(): void {
    this.showOverlay = true;
  }

  closeOverlay(): void {
    this.showOverlay = false;
  }
}
