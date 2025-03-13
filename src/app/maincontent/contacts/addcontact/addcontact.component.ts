import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
@Component({
  selector: 'app-addcontact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './addcontact.component.html',
  styleUrl: './addcontact.component.scss',
})
export class AddcontactComponent {
  firebaseService = inject(FirebaseService); // Inject FirebaseService
  firestore = inject(Firestore); // Inject Firestore

  applyForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
  });

  showOverlay = false;

  openOverlay(): void {
    this.showOverlay = true;
  }

  closeOverlay(): void {
    this.showOverlay = false;
  }

  async submitAddContact() {
    if (this.applyForm.valid) {
      const contactData = this.applyForm.value;

      try {
        await addDoc(collection(this.firestore, 'contacts'), contactData);
        console.log('Contact added successfully!');
        this.closeOverlay(); // Close the overlay after successful submission
        this.applyForm.reset(); // Reset the form
      } catch (error) {
        console.error('Error adding contact:', error);
      }
    }
  }
}
