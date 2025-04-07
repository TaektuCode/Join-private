import { Injectable, inject } from '@angular/core';
import { ContactInterface } from './contact-interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { FirebaseService } from '../../shared/services/firebase.service';

/**
 * A service for managing the selected contact and performing contact-related operations.
 */
@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private selectedContactSubject = new BehaviorSubject<ContactInterface | null>(
    null
  );
  /**
   * An Observable that emits the currently selected contact.
   */
  selectedContact$: Observable<ContactInterface | null> =
    this.selectedContactSubject.asObservable();
  private firebaseService = inject(FirebaseService);

  /**
   * Sets the currently selected contact.
   * @param contact The ContactInterface object to select, or null to deselect.
   */
  setSelectedContact(contact: ContactInterface | null): void {
    this.selectedContactSubject.next(contact);
  }

  /**
   * Deletes a contact from the database using the FirebaseService.
   * @param contactId The ID of the contact to delete.
   * @returns A Promise that resolves when the contact is successfully deleted.
   */
  deleteContact(contactId: string): Promise<void> {
    return this.firebaseService.deleteContact(contactId);
  }
}