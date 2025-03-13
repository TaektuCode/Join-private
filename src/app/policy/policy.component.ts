import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [],
  templateUrl: './policy.component.html',
  styleUrl: './policy.component.scss'
})
export class PolicyComponent {
  constructor(private location: Location) { }

  backPage() {
    this.location.back();
  }
}
