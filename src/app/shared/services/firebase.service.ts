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
          // console.log('Current data: ', element.id, element.data());
          this.contactList.push(
            this.setContactObject(
              element.id,
              element.data() as ContactInterface
            )
          );
        });
      }
    );
  }

  setContactObject(id: string, obj: ContactInterface): ContactInterface {
    return {
      id: id,
      email: obj.email,
      lastname: obj.lastname,
      name: obj.name,
      phone: obj.phone,
    };
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
