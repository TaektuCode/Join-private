import { Component, inject, OnInit, signal, Input, Output, EventEmitter } from '@angular/core';
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
  imports: [DeletecontactComponent, EditcontactComponent, TruncatePipe, CommonModule, RouterModule],
  templateUrl: './viewcontact.component.html',
  styleUrl: './viewcontact.component.scss',
})
export class ViewcontactComponent implements OnInit {
  contactService = inject(ContactService);
  contact: ContactInterface | null = null;
  contactInitials: string = '';
  contactColor: string = '';
  overlayVisible = false;

  // Verwende `visibleSignal` für das interne Signal
  protected visibleSignal = signal(false);
  
  // Umbenennen der Input-Variable, um Konflikte zu vermeiden
  @Input() isVisible: boolean = false;

  @Output() closed = new EventEmitter<void>();
visible: any;

  ngOnInit(): void {
    this.contactService.selectedContact$.subscribe((contact) => {
      this.contact = contact;
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

  // toggleVisibility() verwendet nun das Signal korrekt
  toggleVisibility() {
    console.log('Before toggle:', this.visibleSignal());
    this.visibleSignal.set(!this.visibleSignal()); // Wert ändern mit .set()
    console.log('After toggle:', this.visibleSignal());
  }

  showOverlay = false;

  editContactShowOverlay() {
    this.showOverlay = true;
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

  close(): void {
    this.visibleSignal.set(false); // Sichtbarkeit zurücksetzen
    this.closed.emit();
  }

  toggleOverlay(event: MouseEvent): void {
    event.stopPropagation();
    this.overlayVisible = !this.overlayVisible;
  }
}
