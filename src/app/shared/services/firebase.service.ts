import { Injectable, inject } from '@angular/core';
import { collection, Firestore, onSnapshot } from '@angular/fire/firestore';
import { ContactInterface } from '../../maincontent/contacts/contact-interface';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firebase = inject(Firestore); // Inject Firestore service
  unsubscribe; // Variable to store the unsubscribe function for onSnapshot
  contactList: ContactInterface[] = []; // Array to hold the contact list

  constructor() {
    // Subscribe to real-time updates from the 'contacts' collection
    this.unsubscribe = onSnapshot(
      collection(this.firebase, 'contacts'), // Reference to the 'contacts' collection
      (contactsObject) => {
        // Callback function when data changes
        const sortedContacts: ContactInterface[] = []; // Temporary array to hold sorted contacts
        contactsObject.forEach((element) => {
          // Iterate through each document in the snapshot
          sortedContacts.push(
            this.setContactObject(
              element.id,
              element.data() as ContactInterface // Cast document data to ContactInterface
            )
          );
        });
        // Sort the contacts array alphabetically by 'name'
        sortedContacts.sort((a, b) => a.name.localeCompare(b.name));
        this.contactList = sortedContacts; // Update the contactList with the sorted array
      }
    );
  }

  // Method to create a ContactInterface object from document data
  setContactObject(id: string, obj: ContactInterface): ContactInterface {
    return {
      id: id,
      email: obj.email,
      name: obj.name,
      phone: obj.phone,
      color: obj.color,
    };
  }

  getGroupedContacts(): { letter: string; contacts: ContactInterface[] }[] {
    // Initialize an empty array to hold the grouped contacts
    const grouped: { letter: string; contacts: ContactInterface[] }[] = [];
    // Create a copy of the contactList array to avoid modifying the original
    const sortedContacts = [...this.contactList];
    // Iterate through each contact in the sortedContacts array
    sortedContacts.forEach((contact) => {
      // Get the first letter of the contact's name and convert it to uppercase
      const firstLetter = contact.name.charAt(0).toUpperCase();
      // Find if a group with the same first letter already exists in the grouped array
      let group = grouped.find((g) => g.letter === firstLetter);
      // If a group with the first letter doesn't exist, create a new group
      if (!group) {
        // Create a new group object with the letter and an empty contacts array
        group = { letter: firstLetter, contacts: [] };
        // Add the new group to the grouped array
        grouped.push(group);
      }
      // Add the current contact to the contacts array of the corresponding group
      group.contacts.push(contact);
    });

    // Return the array of grouped contacts
    return grouped;
  }
  // Lifecycle hook to unsubscribe from onSnapshot when the service is destroye
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe(); // Call the unsubscribe function
    }
  }
}
