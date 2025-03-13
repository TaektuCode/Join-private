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
    color: new FormControl(''),
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
      const randomColor = this.getRandomColor(); // Generate a random color

      // Create a new object with the contact data and the random color
      const contactWithColor = {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        color: randomColor,
      };

      await addDoc(collection(this.firestore, 'contacts'), contactWithColor);
      console.log('Contact added successfully!');
      this.closeOverlay();
      this.applyForm.reset();
    }
  }

  getRandomColor(): string {
    const colors = [
      '#FF7A00',
      '#9327FF',
      '#6E52FF',
      '#FC71FF',
      '#FFBB2B',
      '#1FD7C1',
      '#462F8A',
      '#FF4646',
      '#00BEE8',
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }
}
