import { Component, inject, OnInit, signal } from '@angular/core';
import { ContactService } from '../contact.service';
import { ContactInterface } from '../contact-interface';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DeletecontactComponent } from '../deletecontact/deletecontact.component';

@Component({
  selector: 'app-viewcontact',
  standalone: true,
  imports: [DeletecontactComponent],
  templateUrl: './viewcontact.component.html',
  styleUrl: './viewcontact.component.scss',
  animations: [
    trigger('slide', [
      state('false', style({ transform: 'translateX(600%)' })),
      state('true', style({ transform: 'translateX(0)' })),
      transition('false <=> true', animate('0.8s ease-in-out')),
    ]),
  ],
})
export class ViewcontactComponent implements OnInit {
  contactService = inject(ContactService);
  contact: ContactInterface | null = null;
  contactInitials: string = '';
  contactColor: string = '';
  protected visible = signal(false);

  ngOnInit(): void {
    this.contactService.selectedContact$.subscribe((contact) => {
      this.contact = contact;
      if (contact) {
        this.contactInitials = this.getInitials(contact.name); // Use the getInitials method
        this.contactColor = contact.color || '#808080'; // Store the color, default to grey if no color exists
      } else {
        this.contactInitials = '';
        this.contactColor = '';
      }
    });
  }

  toggleVisibility() {
    console.log('Before toggle:', this.visible());
    this.visible.set(!this.visible());
    console.log('After toggle:', this.visible());
  }

  editContact() {
    console.log('Edit Contact:', this.contact);
  }

  getInitials(name: string): string {
    if (!name) {
      return ''; // Handle empty name
    }

    const names = name.trim().split(' '); // Split the name into an array of words
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase(); // Only one name, return first letter
    }

    const firstNameInitial = names[0].charAt(0).toUpperCase();
    const lastNameInitial = names[names.length - 1].charAt(0).toUpperCase(); // Last word is assumed to be last name

    return firstNameInitial + lastNameInitial;
  }
}
