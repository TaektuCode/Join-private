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
      lastname: obj.lastname,
      name: obj.name,
      phone: obj.phone,
    };
  }

  // Lifecycle hook to unsubscribe from onSnapshot when the service is destroye
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
