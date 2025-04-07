import { Component } from '@angular/core';
import { ContactlistComponent } from './contactlist/contactlist.component';
import { ViewcontactComponent } from './viewcontact/viewcontact.component';

/**
 * Component that serves as the main container for the contacts feature,
 * displaying the contact list and the contact details view side-by-side.
 */
@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ContactlistComponent, ViewcontactComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent {}