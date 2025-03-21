import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../shared/services/firebase.service';
import { TaskInterface } from './task.interface';
import { FormsModule } from '@angular/forms';
import { ContactInterface } from '../contacts/contact-interface';
import { Subscription } from 'rxjs';
import { TruncatePipe } from '../../truncate.pipe';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [FormsModule, TruncatePipe],
  templateUrl: './addtask.component.html',
  styleUrls: ['./addtask.component.scss'],
})
export class AddtaskComponent implements OnInit {
  newTask: TaskInterface = {
    title: '',
    date: new Date(),
    category: '',
    description: '',
    assignedTo: [],
    created: new Date(),
    edited: new Date(),
    priority: 'medium',
    subtask: [],
  };
  contacts: ContactInterface[] = [];
  contactSubscription: Subscription | undefined;
  isDropdownOpen = false;
  selectedContact: ContactInterface | null = null;
  checkedContacts: { [key: string]: boolean } = {};

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.contactSubscription = this.firebaseService.contactList.subscribe(
      (contacts) => {
        this.contacts = contacts;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.contactSubscription) {
      this.contactSubscription.unsubscribe();
    }
  }

  createTask() {
    this.firebaseService.createTask(this.newTask).then(() => {
      console.log('Task created successfully!');
      this.resetForm();
    });
  }

  resetForm() {
    this.newTask = {
      title: '',
      date: new Date(),
      category: '',
      description: '',
      assignedTo: [],
      created: new Date(),
      edited: new Date(),
      priority: 'medium',
      subtask: [],
    };
  }

  setPriority(priority: 'urgent' | 'medium' | 'low') {
    this.newTask.priority = priority;
  }

  addSubtask(subtaskTitle: string) {
    if (subtaskTitle) {
      this.newTask.subtask?.push({ title: subtaskTitle, completed: false });
    }
  }

  removeSubtask(index: number) {
    this.newTask.subtask?.splice(index, 1);
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

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectContact(contact: ContactInterface) {
    if (contact.id) {
      this.selectedContact = contact;
      this.newTask.assignedTo = [contact.id];
      // this.isDropdownOpen = false;
      this.checkedContacts[contact.id] = !this.checkedContacts[contact.id];
    }
  }

  getSelectedContacts(): ContactInterface[] {
    return this.contacts.filter((contact) => {
      if (contact.id) {
        return this.checkedContacts[contact.id];
      }
      return false;
    });
  }
}
