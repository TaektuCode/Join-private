import { Component } from '@angular/core';
import { ViewcontactComponent } from './viewcontact/viewcontact.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ViewcontactComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {

}
