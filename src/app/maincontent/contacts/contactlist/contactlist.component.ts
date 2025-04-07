import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { ContactService } from '../contact.service';
import { ContactInterface } from '../contact-interface';
import { AddcontactComponent } from '../addcontact/addcontact.component';
import { TruncatePipe } from '../../../truncate.pipe';
import { Subscription } from 'rxjs'; // Import Subscription

/**
 * Component to display a list of contacts, grouped by the first letter of their name.
 */
@Component({
  selector: 'app-contactlist',
  standalone: true,
  imports: [AddcontactComponent, TruncatePipe],
  templateUrl: './contactlist.component.html',
  styleUrl: './contactlist.component.scss',
})
export class ContactlistComponent implements OnInit, OnDestroy {
  private firebaseService = inject(FirebaseService);
  private contactService = inject(ContactService);
  /**
   * The ID of the currently selected contact.
   */
  selectedContactId: string | undefined | null;
  /**
   * Array of contacts grouped by the first letter of their name.
   */
  groupedContacts: { letter: string; contacts: ContactInterface[] }[] = [];
  /**
   * Subscription to the grouped contacts observable.
   */
  groupedContactsSubscription: Subscription | undefined;

  /**
   * Lifecycle hook called once the component is initialized.
   * Subscribes to the selected contact and the grouped contacts.
   */
  ngOnInit(): void {
    this.contactService.selectedContact$.subscribe((contact) => {
      this.selectedContactId = contact?.id ?? null;
    });

    // Subscribe to grouped contacts
    this.groupedContactsSubscription = this.firebaseService
      .getGroupedContacts()
      .subscribe((grouped) => {
        this.groupedContacts = grouped;
      });
  }

  /**
   * Lifecycle hook called just before the component is destroyed.
   * Unsubscribes from the grouped contacts subscription to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.groupedContactsSubscription) {
      this.groupedContactsSubscription.unsubscribe();
    }
  }

  /**
   * Returns the initials of a contact's name.
   * @param name The full name of the contact.
   * @returns A string containing the uppercase initials of the first and last names.
   */
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

  /**
   * Sets the selected contact using the ContactService.
   * @param contact The ContactInterface object to select.
   */
  selectContact(contact: ContactInterface): void {
    this.contactService.setSelectedContact(contact);
  }

  /**
   * Checks if a given contact is currently the active (selected) contact.
   * @param contact The ContactInterface object to check.
   * @returns True if the contact is active, false otherwise.
   */
  isContactActive(contact: ContactInterface): boolean {
    return this.selectedContactId === contact.id;
  }
}