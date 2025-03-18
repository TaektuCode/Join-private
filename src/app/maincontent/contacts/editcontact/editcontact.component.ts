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
    name: new FormControl(''),
    email: new FormControl('', [Validators.email]),
    phone: new FormControl('', [Validators.pattern(/^[\+]?[0-9]+$/)]),
  });

  showOverlay = false;
  contactInitials: string = '';

  ngOnInit(): void {
    if (this.contact) {
      this.contactInitials = this.getInitials(this.contact.name);
    }
  }

  editContactShowOverlay(): void {
    this.showOverlay = true;
    if (this.contact) {
      this.contactInitials = this.getInitials(this.contact.name);
      this.applyForm.patchValue({
        name: this.contact.name,
        email: this.contact.email,
        phone: this.contact.phone ? this.contact.phone.toString() : '',
      });
    }
  }

  closeOverlay(): void {
    this.showOverlay = false;
    this.applyForm.reset();
    this.editFinished.emit();
  }

  async submitEditContact() {
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
