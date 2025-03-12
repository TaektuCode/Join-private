import { Injectable } from '@angular/core';
import { ContactInterface } from './contact-interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private selectedContactSubject = new BehaviorSubject<ContactInterface | null>(
    null
  );
  selectedContact$: Observable<ContactInterface | null> =
    this.selectedContactSubject.asObservable();

  setSelectedContact(contact: ContactInterface | null): void {
    console.log('Contact set in service:', contact); // Prüfe die Daten im Service
    this.selectedContactSubject.next(contact);
  }
}
