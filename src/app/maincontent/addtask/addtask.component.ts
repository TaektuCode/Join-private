import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { FirebaseService } from '../../shared/services/firebase.service';
import { TaskInterface } from './task.interface';
import { FormsModule } from '@angular/forms';
import { ContactInterface } from '../contacts/contact-interface';
import { Subscription } from 'rxjs';
import { TruncatePipe } from '../../truncate.pipe';
import { TaskService } from './task.service';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [FormsModule, TruncatePipe],
  templateUrl: './addtask.component.html',
  styleUrls: ['./addtask.component.scss'],
})
export class AddtaskComponent implements OnInit {
  @Output() taskCreated = new EventEmitter<TaskInterface>();

  newTask: TaskInterface = {
    title: '',
    date: this.getTodayDate(),
    category: null,
    description: '',
    assignedTo: [],
    created: new Date(),
    edited: new Date(),
    priority: 'medium',
    subtask: [],
    status: 'Todo', // Standardmäßig auf 'Todo' setzen
  };
  contacts: ContactInterface[] = [];
  contactSubscription: Subscription | undefined;
  isDropdownOpen = false;
  selectedContact: ContactInterface | null = null;
  checkedContacts: { [key: string]: boolean } = {};
  errors: { title: boolean; date: boolean; category: boolean } = {
    title: false,
    date: false,
    category: false,
  };

  //Kategorie-Dropdown
  isCategoryDropdownOpen: boolean = false;
  selectedCategory: string | null = null;
  categories: string[] = ['Technical Task', 'User Story'];

  constructor(
    private firebaseService: FirebaseService,
    private taskService: TaskService // Injizieren Sie Ihren TaskService
  ) {}

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
    this.errors.title = !this.newTask.title;
    this.errors.date = !this.newTask.date;
    this.errors.category = !this.newTask.category;

    if (this.errors.title || this.errors.date || this.errors.category) {
      return; // Verhindere das Erstellen des Tasks, wenn Fehler vorhanden sind
    }

    this.firebaseService.createTask(this.newTask).then(() => {
      console.log('Task created successfully!');
      this.taskService.addTask(this.newTask); // Übertragen Sie den Task über Ihren Service
      this.taskCreated.emit(this.newTask); // Emit the new task
      this.resetForm();
    });
  }

  resetForm() {
    this.newTask = {
      title: '',
      date: '',
      category: null,
      description: '',
      assignedTo: [],
      created: new Date(),
      edited: new Date(),
      priority: 'medium',
      subtask: [],
      status: 'Todo',
    };
    this.errors = { title: false, date: false, category: false };
    this.isCategoryDropdownOpen = false;
    this.selectedCategory = null;
    this.checkedContacts = {};
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
      this.checkedContacts[contact.id] = !this.checkedContacts[contact.id];
    }
  }

  getSelectedContacts(): ContactInterface[] {
    this.newTask.assignedTo = this.contacts
      .filter((contact) => contact.id && this.checkedContacts[contact.id])
      .map((contact) => contact.id!);
    return this.contacts.filter(
      (contact) => contact.id && this.checkedContacts[contact.id]
    );
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  selectCategory(category: string | null) {
    this.selectedCategory = category;
    this.newTask.category = category;
    this.isCategoryDropdownOpen = false;
    this.resetError('category');
  }

  resetError(fieldName: string) {
    if (fieldName === 'title') {
      this.errors.title = false;
    } else if (fieldName === 'date') {
      this.errors.date = false;
    } else if (fieldName === 'category') {
      this.errors.category = false;
    }
  }
}
