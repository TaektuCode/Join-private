import { Component, Input, inject, Output, EventEmitter } from '@angular/core';
import { ContactService } from '../contact.service';

/**
 * Component for confirming the deletion of a contact.
 */
@Component({
  selector: 'app-deletecontact',
  standalone: true,
  imports: [],
  templateUrl: './deletecontact.component.html',
  styleUrl: './deletecontact.component.scss',
})
export class DeletecontactComponent {
  /**
   * The ID of the contact to be deleted.
   */
  @Input() contactId: string | undefined;
  /**
   * Emits an event when the delete action is confirmed.
   */
  @Output() deleteConfirmed = new EventEmitter<void>();
  private contactService = inject(ContactService);

  /**
   * Deletes the contact using the ContactService and emits the deleteConfirmed event.
   */
  async deleteContact() {
    if (this.contactId) {
      await this.contactService.deleteContact(this.contactId);
      this.deleteConfirmed.emit();
    }
  }
}