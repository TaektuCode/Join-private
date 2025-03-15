import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  constructor(private location: Location) { }

  backPage() {
    this.location.back();
  }
}
