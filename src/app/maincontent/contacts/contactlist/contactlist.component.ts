import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { ContactService } from '../contact.service';
import { ContactInterface } from '../contact-interface';
import { AddcontactComponent } from '../addcontact/addcontact.component';
import { TruncatePipe } from '../../../truncate.pipe';
import { Subscription } from 'rxjs'; // Import Subscription

@Component({
  selector: 'app-contactlist',
  standalone: true,
  imports: [AddcontactComponent, TruncatePipe],
  templateUrl: './contactlist.component.html',
  styleUrl: './contactlist.component.scss',
})
export class ContactlistComponent implements OnInit, OnDestroy {
  firebaseService = inject(FirebaseService);
  contactService = inject(ContactService);
  selectedContactId: string | undefined | null;
  groupedContacts: { letter: string; contacts: ContactInterface[] }[] = []; // Füge diese Eigenschaft hinzu
  groupedContactsSubscription: Subscription | undefined; // Füge diese Eigenschaft hinzu

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

  ngOnDestroy(): void {
    if (this.groupedContactsSubscription) {
      this.groupedContactsSubscription.unsubscribe();
    }
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

  selectContact(contact: ContactInterface): void {
    this.contactService.setSelectedContact(contact);
  }

  isContactActive(contact: ContactInterface): boolean {
    return this.selectedContactId === contact.id;
  }
}
