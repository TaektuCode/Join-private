import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { ContactService } from '../contact.service'; // Import ContactService
import { ContactInterface } from '../contact-interface'; // Import ContactInterface
import { AddcontactComponent } from '../addcontact/addcontact.component';

@Component({
  selector: 'app-contactlist',
  standalone: true,
  imports: [AddcontactComponent],
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

  // Method to generate a random color based on the index
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
    // Return a color from the array based on the index modulo the array length, creating a rotation effect
    return colors[index % colors.length]; // Rotate through colors based on index
  }

  // Method to set the selected contact in the ContactService
  selectContact(contact: ContactInterface): void {
    this.contactService.setSelectedContact(contact);
  }
}
