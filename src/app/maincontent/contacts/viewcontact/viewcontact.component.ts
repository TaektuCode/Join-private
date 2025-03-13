import { Component, inject, OnInit } from '@angular/core';
import { ContactService } from '../contact.service'; // Import ContactService
import { ContactInterface } from '../contact-interface'; // Import ContactInterface

@Component({
  selector: 'app-viewcontact',
  standalone: true,
  imports: [],
  templateUrl: './viewcontact.component.html',
  styleUrl: './viewcontact.component.scss',
})
export class ViewcontactComponent {
  // @Input() contact: {
  //   name: string;
  //   lastname: string;
  //   email: string;
  //   phone: string;
  // } = {
  //   name: 'Denis',
  //   lastname: 'Welsch',
  //   email: 'denis@gmail.de',
  //   phone: '+49 1652 154 65',
  // };

  // get contactInitials(): string {
  //   return this.extractInitials(this.contact.name, this.contact.lastname);
  // }

  // private extractInitials(name: string, lastname: string): string {
  //   const firstInitial = name ? name.charAt(0).toUpperCase() : '';
  //   const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
  //   return firstInitial + lastInitial;
  // }

  contactService = inject(ContactService);
  contact: ContactInterface | null = null;
  contactInitials: string = '';

  ngOnInit(): void {
    this.contactService.selectedContact$.subscribe((contact) => {
      this.contact = contact;
      if (contact) {
        this.contactInitials =
          contact.name.charAt(0).toUpperCase() +
          contact.lastname.charAt(0).toUpperCase();
      } else {
        this.contactInitials = '';
      }
    });
  }

  editContact() {
    console.log('Edit Contact:', this.contact);
    // Hier könnte eine Navigationslogik oder ein Popup zum Bearbeiten geöffnet werden
  }

  deleteContact() {
    console.log('Delete Contact:', this.contact);
    // Hier könnte eine Bestätigungsabfrage und die Löschlogik implementiert werden
  }
}
