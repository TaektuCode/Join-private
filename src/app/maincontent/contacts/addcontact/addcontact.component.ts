import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
} from '@angular/forms';
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
  firebaseService = inject(FirebaseService);
  firestore = inject(Firestore);
  fb = inject(FormBuilder); // Inject FormBuilder

  applyForm: FormGroup; // Deklariere applyForm als FormGroup

  showOverlay = false;
  formSubmitted = false;

  constructor() {
    this.applyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[0-9]+$/)]],
    });
  }

  openOverlay(): void {
    this.showOverlay = true;
  }

  closeOverlay(): void {
    this.showOverlay = false;
    this.applyForm.reset();
    this.formSubmitted = false;
  }

  async submitAddContact() {
    this.formSubmitted = true;
    if (this.applyForm.valid) {
      const contactData = this.applyForm.value;
      const randomColor = this.getRandomColor();

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
    } else {
      this.formError(this.applyForm); // Fehler anzeigen
    }
  }

  formError(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.formError(control);
      }
    });
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

  getErrorTopPosition(index: number): number {
    return 55 + index * 85;
  }
}
