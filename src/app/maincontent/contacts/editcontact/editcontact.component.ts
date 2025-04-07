import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { Firestore, updateDoc, doc } from '@angular/fire/firestore';
import { FirebaseService } from '../../../shared/services/firebase.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ContactInterface } from '../contact-interface';

/**
 * Component for editing existing contact details.
 */
@Component({
  selector: 'app-editcontact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './editcontact.component.html',
  styleUrl: './editcontact.component.scss',
})
export class EditcontactComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private firestore = inject(Firestore);

  /**
   * The contact object to be edited.
   */
  @Input() contact: ContactInterface | null = null;
  /**
   * Emits an event when the editing process is finished (either saved or cancelled).
   */
  @Output() editFinished = new EventEmitter<void>();

  /**
   * The form group for editing contact details.
   */
  applyForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]), // Add validation for name
    email: new FormControl('', [Validators.required, Validators.email]), // Add required validator
    phone: new FormControl('', [Validators.pattern(/^[\+]?[0-9]+$/)]),
  });

  /**
   * Controls the visibility of the edit contact overlay.
   */
  showOverlay = false;
  /**
   * The initials of the contact's name.
   */
  contactInitials: string = '';
  /**
   * Indicates if the form has been submitted.
   */
  formSubmitted = false; // Declare formSubmitted

  /**
   * Lifecycle hook called once the component is initialized.
   * Populates the form with the contact's data if a contact is provided.
   */
  ngOnInit(): void {
    if (this.contact) {
      this.contactInitials = this.getInitials(this.contact.name);
      this.applyForm.patchValue({
        name: this.contact.name,
        email: this.contact.email,
        phone: this.contact.phone ? this.contact.phone.toString() : '',
      });
    }
  }

  /**
   * Shows the edit contact overlay and populates the form with the current contact's data.
   */
  editContactShowOverlay(): void {
    this.showOverlay = true;
    this.formSubmitted = false; // Reset formSubmitted on open
    if (this.contact) {
      this.contactInitials = this.getInitials(this.contact.name);
      this.applyForm.patchValue({
        name: this.contact.name,
        email: this.contact.email,
        phone: this.contact.phone ? this.contact.phone.toString() : '',
      });
      // Optional: Reset validation and touch status
      this.applyForm.markAsUntouched();
      this.applyForm.updateValueAndValidity();
    }
  }

  /**
   * Calculates the top position for displaying an error message based on the input index.
   * @param index The index of the input field.
   * @returns The calculated top position in pixels.
   */
  getErrorTopPosition(index: number): number {
    return 55 + index * 85;
  }

  /**
   * Closes the edit contact overlay and resets the form.
   */
  closeOverlay(): void {
    this.showOverlay = false;
    this.applyForm.reset();
    this.formSubmitted = false; // Reset formSubmitted on close
    this.editFinished.emit();
  }

  /**
   * Submits the edited contact data to Firestore.
   */
  async submitEditContact() {
    this.formSubmitted = true; // Set formSubmitted to true on submit
    if (this.applyForm.valid && this.contact && this.contact.id) {
      const contactData = this.applyForm.value;

      const contactWithColor = {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        color: this.contact.color, // Use the original color
      };

      const contactDocRef = doc(this.firestore, 'contacts', this.contact.id);
      await updateDoc(contactDocRef, contactWithColor);
      this.closeOverlay();
    }
  }

  /**
   * Returns the initials of a contact's name.
   * @param name The full name of the contact.
   * @returns A string containing the uppercase initials of the first and last names.
   */
  getInitials(name: string): string {
    if (!name) {
      return '';
    }

    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    const firstNameInitial = names[0].charAt(0).toUpperCase();
    const lastNameInitial = names[names.length - 1].charAt(0).toUpperCase();

    return firstNameInitial + lastNameInitial;
  }
}