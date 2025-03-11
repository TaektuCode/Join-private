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

  getRandomColor(index: number): string {
    const colors = [
      '#FF5733',
      '#33FF57',
      '#3357FF',
      '#FF33A5',
      '#F3FF33',
      '#33FFF7',
      '#FF8333',
    ];
    return colors[index % colors.length]; // Rotate through colors based on index
  }
}
