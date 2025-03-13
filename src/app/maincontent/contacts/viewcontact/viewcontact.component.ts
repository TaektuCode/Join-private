import { Component, inject, OnInit, signal } from '@angular/core';
import { ContactService } from '../contact.service';
import { ContactInterface } from '../contact-interface';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-viewcontact',
  standalone: true,
  imports: [],
  templateUrl: './viewcontact.component.html',
  styleUrl: './viewcontact.component.scss',
  animations: [
    trigger('slide', [
      state('false', style({ transform: 'translateX(600%)' })), 
      state('true', style({ transform: 'translateX(0)' })), 
      transition('false <=> true', animate('0.8s ease-in-out'))
    ])
  ]
})
export class ViewcontactComponent implements OnInit {

  contactService = inject(ContactService);
  contact: ContactInterface | null = null;
  contactInitials: string = '';
  protected visible = signal(false);

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

  toggleVisibility() {
    console.log('Before toggle:', this.visible());
    this.visible.set(!this.visible());
    console.log('After toggle:', this.visible());
  }

  editContact() {
    console.log('Edit Contact:', this.contact);
  }

  deleteContact() {
    console.log('Delete Contact:', this.contact);
  }
}
