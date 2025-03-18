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
  contactService = inject(ContactService);
  contact: ContactInterface | null = null;
  contactInitials: string = '';
  contactColor: string = '';
  overlayVisible = false;

  @ViewChild('overlayMenu') overlayMenu: ElementRef | undefined;

  ngOnInit(): void {
    this.contactService.selectedContact$.subscribe((contact) => {
      this.contact = contact;
      this.overlayVisible = false; // Schließe das Overlay, wenn ein neuer Kontakt ausgewählt wird
      if (contact) {
        this.contactInitials = this.getInitials(contact.name);
        this.contactColor = contact.color || '#808080';
      } else {
        this.contactInitials = '';
        this.contactColor = '';
      }
    });
  }

  onContactDeleted() {
    this.contact = null;
  }

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

  toggleOverlay(event: MouseEvent): void {
    event.stopPropagation(); // Prevent the click on the button from immediately triggering the document click
    this.overlayVisible = !this.overlayVisible;
  }

  close(): void {
    this.overlayVisible = false;
  }

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
