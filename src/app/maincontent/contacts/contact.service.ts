import { Injectable, inject } from '@angular/core';
import { ContactInterface } from './contact-interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseService } from '../../shared/services/firebase.service';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private selectedContactSubject = new BehaviorSubject<ContactInterface | null>(
    null
  );
  selectedContact$: Observable<ContactInterface | null> =
    this.selectedContactSubject.asObservable();
  private firebaseService = inject(FirebaseService);

  setSelectedContact(contact: ContactInterface | null): void {
    console.log('Contact set in service:', contact); // Prüfe die Daten im Service
    this.selectedContactSubject.next(contact);
  }

  deleteContact(contactId: string): Promise<void> {
    return this.firebaseService.deleteContact(contactId);
  }
}
