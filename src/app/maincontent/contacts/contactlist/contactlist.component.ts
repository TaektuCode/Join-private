import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { ContactService } from '../contact.service'; // Import ContactService
import { ContactInterface } from '../contact-interface'; // Import ContactInterface
import { AddcontactComponent } from '../addcontact/addcontact.component';
import { TruncatePipe } from '../../../truncate.pipe';
@Component({
  selector: 'app-contactlist',
  standalone: true,
  imports: [AddcontactComponent, TruncatePipe],
  templateUrl: './contactlist.component.html',
  styleUrl: './contactlist.component.scss',
})
export class ContactlistComponent {
  firebaseService = inject(FirebaseService);
  contactService = inject(ContactService);

  // Getter method to retrieve the grouped contacts from the FirebaseService
  get groupedContacts() {
    // Call the getGroupedContacts method of the FirebaseService and return the result
    return this.firebaseService.getGroupedContacts();
  }

  getInitials(name: string): string {
    if (!name) {
      return ''; // Handle empty name
    }

    const names = name.trim().split(' '); // Split the name into an array of words
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase(); // Only one name, return first letter
    }

    const firstNameInitial = names[0].charAt(0).toUpperCase();
    const lastNameInitial = names[names.length - 1].charAt(0).toUpperCase(); // Last word is assumed to be last name

    return firstNameInitial + lastNameInitial;
  }

  // Method to set the selected contact in the ContactService
  selectContact(contact: ContactInterface): void {
    this.contactService.setSelectedContact(contact);
  }
}
