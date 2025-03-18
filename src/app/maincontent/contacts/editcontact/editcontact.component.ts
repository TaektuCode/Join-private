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

@Component({
  selector: 'app-editcontact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './editcontact.component.html',
  styleUrl: './editcontact.component.scss',
})
export class EditcontactComponent implements OnInit {
  firebaseService = inject(FirebaseService);
  firestore = inject(Firestore);

  @Input() contact: ContactInterface | null = null;
  @Output() editFinished = new EventEmitter<void>();

  applyForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]), // Füge Validierung für Name hinzu
    email: new FormControl('', [Validators.required, Validators.email]), // Füge Required-Validator hinzu
    phone: new FormControl('', [Validators.pattern(/^[\+]?[0-9]+$/)]),
  });

  showOverlay = false;
  contactInitials: string = '';
  formSubmitted = false; // Deklariere formSubmitted

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

  editContactShowOverlay(): void {
    this.showOverlay = true;
    this.formSubmitted = false; // Setze formSubmitted beim Öffnen zurück
    if (this.contact) {
      this.contactInitials = this.getInitials(this.contact.name);
      this.applyForm.patchValue({
        name: this.contact.name,
        email: this.contact.email,
        phone: this.contact.phone ? this.contact.phone.toString() : '',
      });
      // Optional: Setze Validierungs- und Touch-Status zurück
      this.applyForm.markAsUntouched();
      this.applyForm.updateValueAndValidity();
    }
  }

  getErrorTopPosition(index: number): number {
    return 55 + index * 85;
  }

  closeOverlay(): void {
    this.showOverlay = false;
    this.applyForm.reset();
    this.formSubmitted = false; // Setze formSubmitted beim Schließen zurück
    this.editFinished.emit();
  }

  async submitEditContact() {
    this.formSubmitted = true; // Setze formSubmitted auf true beim Absenden
    if (this.applyForm.valid && this.contact && this.contact.id) {
      const contactData = this.applyForm.value;

      const contactWithColor = {
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        color: this.contact.color, // Verwende die ursprüngliche Farbe
      };

      const contactDocRef = doc(this.firestore, 'contacts', this.contact.id);
      await updateDoc(contactDocRef, contactWithColor);
      console.log('Contact updated successfully!');
      this.closeOverlay();
    }
  }

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
