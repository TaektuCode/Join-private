import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../../shared/services/firebase.service';

@Component({
  selector: 'app-contactlist',
  standalone: true,
  imports: [],
  templateUrl: './contactlist.component.html',
  styleUrl: './contactlist.component.scss',
})
export class ContactlistComponent {
  firebaseService = inject(FirebaseService);
}
