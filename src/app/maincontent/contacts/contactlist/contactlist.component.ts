import { Component, inject, OnInit } from '@angular/core';
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
export class ContactlistComponent implements OnInit {
  firebaseService = inject(FirebaseService);
  contactService = inject(ContactService);

  selectedContactId: string | undefined | null; // Variable to track the ID of the selected contact

  // Getter method to retrieve the grouped contacts from the FirebaseService
  get groupedContacts() {
    return this.firebaseService.getGroupedContacts();
  }

  ngOnInit(): void {
    // Subscribe to changes in the selected contact from the ContactService
    this.contactService.selectedContact$.subscribe((contact) => {
      this.selectedContactId = contact?.id ?? null;
    });
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

  // Method to set the selected contact in the ContactService
  selectContact(contact: ContactInterface): void {
    this.contactService.setSelectedContact(contact);
  }

  // Helper method to check if a contact is currently selected
  isContactActive(contact: ContactInterface): boolean {
    return this.selectedContactId === contact.id;
  }
}
