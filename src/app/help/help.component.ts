import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {
  constructor(private location: Location) { }

  backPage() {
    this.location.back();
  }
}
