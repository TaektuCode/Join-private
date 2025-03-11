import { Injectable, inject } from '@angular/core';
import { collection, Firestore, onSnapshot } from '@angular/fire/firestore';
import { ContactInterface } from '../../maincontent/contacts/contact-interface';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firebase = inject(Firestore);
  unsubscribe;
  contactList: ContactInterface[] = [];

  constructor() {
    this.unsubscribe = onSnapshot(
      collection(this.firebase, 'contacts'),
      (contactsObject) => {
        contactsObject.forEach((element) => {
          console.log('Current data: ', element.id, element.data());
        });
      }
    );
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
