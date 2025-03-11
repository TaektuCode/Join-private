import { Component } from '@angular/core';
import { ContactlistComponent } from './contactlist/contactlist.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ContactlistComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent {}
