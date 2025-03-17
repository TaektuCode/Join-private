import { Component, Input, inject, Output, EventEmitter } from '@angular/core';
import { ContactService } from '../contact.service';

@Component({
  selector: 'app-deletecontact',
  standalone: true,
  imports: [],
  templateUrl: './deletecontact.component.html',
  styleUrl: './deletecontact.component.scss',
})
export class DeletecontactComponent {
  @Input() contactId: string | undefined;
  @Output() deleteConfirmed = new EventEmitter<void>();
  private contactService = inject(ContactService);

  async deleteContact() {
    if (this.contactId) {
      await this.contactService.deleteContact(this.contactId);
      this.deleteConfirmed.emit();
    }
  }
}
