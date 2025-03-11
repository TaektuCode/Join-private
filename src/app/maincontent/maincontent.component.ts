import { Component } from '@angular/core';
import { ContactsComponent } from "./contacts/contacts.component";

@Component({
  selector: 'app-maincontent',
  standalone: true,
  imports: [ContactsComponent],
  templateUrl: './maincontent.component.html',
  styleUrl: './maincontent.component.scss'
})
export class MaincontentComponent {

}
