import { Component, inject } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

/**
 * Component for adding new contacts.
 */
@Component({
  selector: 'app-addcontact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './addcontact.component.html',
  styleUrl: './addcontact.component.scss',
})
export class AddcontactComponent {
  private firestore = inject(Firestore);
  private fb = inject(FormBuilder);

  /**
   * The form group for adding contacts.
   */
  applyForm: FormGroup;

  /**
   * Controls the visibility of the add contact overlay.
   */
  showOverlay = false;
  /**
   * Indicates if the form has been submitted.
   */
  formSubmitted = false;

  /**
   * Initializes the AddcontactComponent and sets up the add contact form.
   */
  constructor() {
    this.applyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[0-9]+$/)]],
    });
  }

  /**
   * Opens the add contact overlay.
   */
  openOverlay(): void {
    this.showOverlay = true;
  }

  /**
   * Closes the add contact overlay and resets the form.
   */
  closeOverlay(): void {
    this.showOverlay = false;
    this.applyForm.reset();
    this.formSubmitted = false;
  }

  /**
   * Submits the add contact form and adds the contact to Firestore.
   */
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
      this.closeOverlay();
      this.applyForm.reset();
    } else {
      this.formError(this.applyForm); // Display errors
    }
  }

  /**
   * Marks all controls in a form group as touched to display validation errors.
   * Recursively handles nested form groups.
   * @param formGroup The FormGroup to check.
   */
  formError(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.formError(control);
      }
    });
  }

  /**
   * Generates a random color from a predefined list.
   * @returns A random color string.
   */
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

  /**
   * Calculates the top position for displaying an error message based on the input index.
   * @param index The index of the input field.
   * @returns The calculated top position in pixels.
   */
  getErrorTopPosition(index: number): number {
    return 55 + index * 85;
  }
}