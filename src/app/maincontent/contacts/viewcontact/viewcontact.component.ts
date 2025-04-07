import {
  Component,
  inject,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ContactService } from '../contact.service';
import { ContactInterface } from '../contact-interface';
import { DeletecontactComponent } from '../deletecontact/deletecontact.component';
import { EditcontactComponent } from '../editcontact/editcontact.component';
import { TruncatePipe } from '../../../truncate.pipe';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Component to display the details of a selected contact and provide options for editing and deleting.
 */
@Component({
  selector: 'app-viewcontact',
  standalone: true,
  imports: [
    DeletecontactComponent,
    EditcontactComponent,
    TruncatePipe,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './viewcontact.component.html',
  styleUrl: './viewcontact.component.scss',
})
export class ViewcontactComponent implements OnInit {
  private contactService = inject(ContactService);
  /**
   * The currently selected contact to view.
   */
  contact: ContactInterface | null = null;
  /**
   * The initials of the displayed contact.
   */
  contactInitials: string = '';
  /**
   * The color associated with the displayed contact.
   */
  contactColor: string = '';
  /**
   * Controls the visibility of the overlay menu for editing and deleting.
   */
  overlayVisible = false;

  /**
   * Reference to the overlay menu element.
   */
  @ViewChild('overlayMenu') overlayMenu: ElementRef | undefined;

  /**
   * Lifecycle hook called once the component is initialized.
   * Subscribes to the selected contact from the ContactService to update the view.
   */
  ngOnInit(): void {
    this.contactService.selectedContact$.subscribe((contact) => {
      this.contact = contact;
      this.overlayVisible = false; // Close overlay when a new contact is selected
      if (contact) {
        this.contactInitials = this.getInitials(contact.name);
        this.contactColor = contact.color || '#808080';
      } else {
        this.contactInitials = '';
        this.contactColor = '';
      }
    });
  }

  /**
   * Handles the event when a contact is successfully deleted.
   * Clears the displayed contact.
   */
  onContactDeleted() {
    this.contact = null;
  }

  /**
   * Returns the initials of a contact's name.
   * @param name The full name of the contact.
   * @returns A string containing the uppercase initials of the first and last names.
   */
  getInitials(name: string): string {
    if (!name) {
      return '';
    }
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    const firstNameInitial = names[0].charAt(0).toUpperCase();
    const lastNameInitial = names[names.length - 1].charAt(0).toUpperCase();
    return firstNameInitial + lastNameInitial;
  }

  /**
   * Toggles the visibility of the overlay menu for editing and deleting.
   * Prevents the click event from propagating to the document listener immediately.
   * @param event The mouse click event.
   */
  toggleOverlay(event: MouseEvent): void {
    event.stopPropagation(); // Prevent button click from immediately triggering document click
    this.overlayVisible = !this.overlayVisible;
  }

  /**
   * Closes the overlay menu.
   */
  close(): void {
    this.overlayVisible = false;
  }

  /**
   * Host listener that listens for document-wide click events.
   * Closes the overlay menu if the click occurs outside the menu.
   * @param event The mouse click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.overlayVisible &&
      this.overlayMenu &&
      this.overlayMenu.nativeElement &&
      !this.overlayMenu.nativeElement.contains(event.target)
    ) {
      this.close();
    }
  }
}