import { Component } from '@angular/core';
import { ContactlistComponent } from './contactlist/contactlist.component';
import { ViewcontactComponent } from './viewcontact/viewcontact.component';


@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ContactlistComponent, ViewcontactComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent {}
