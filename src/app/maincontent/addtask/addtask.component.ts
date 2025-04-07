import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { FirebaseService } from '../../shared/services/firebase.service';
import { TaskInterface } from './task.interface';
import { FormsModule } from '@angular/forms';
import { ContactInterface } from '../contacts/contact-interface';
import { Subscription } from 'rxjs';
import { TruncatePipe } from '../../truncate.pipe';
import { TaskService } from './task.service';
import { Router } from '@angular/router';

/**
 * Represents a subtask within a larger task.
 */
interface Subtask {
  /** The title of the subtask. */
  title: string;
  /** Indicates if the subtask has been completed. */
  completed: boolean;
  /** Indicates if the subtask is currently being edited. */
  isEditing?: boolean;
}

/**
 * Component for adding new tasks.
 */
@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [FormsModule, TruncatePipe],
  templateUrl: './addtask.component.html',
  styleUrls: ['./addtask.component.scss'],
})
export class AddtaskComponent implements OnInit, OnDestroy {
  /**
   * Emits a new TaskInterface object when a task is created.
   */
  @Output() taskCreated = new EventEmitter<TaskInterface>();

  /**
   * The new task object being created.
   */
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
    status: 'Todo', // Default status is 'Todo'
  };

  /**
   * The title of a new subtask being added.
   */
  newSubtaskTitle: string = '';
  /**
   * Array of contacts to assign to the task.
   */
  contacts: ContactInterface[] = [];
  /**
   * Subscription to the contact list observable.
   */
  contactSubscription: Subscription | undefined;
  /**
   * Controls the visibility of the contacts dropdown.
   */
  isDropdownOpen = false;
  /**
   * The currently selected contact (for single selection, though checkboxes are used).
   */
  selectedContact: ContactInterface | null = null;
  /**
   * Object to track the checked state of contacts in the dropdown.
   */
  checkedContacts: { [key: string]: boolean } = {};
  /**
   * Object to track form validation errors.
   */
  errors: { title: boolean; date: boolean; category: boolean } = {
    title: false,
    date: false,
    category: false,
  };

  /**
   * Controls the visibility of the category dropdown.
   */
  isCategoryDropdownOpen: boolean = false;
  /**
   * The currently selected category for the task.
   */
  selectedCategory: string | null = null;
  /**
   * Available categories for the task.
   */
  categories: string[] = ['Technical Task', 'User Story'];

  /**
   * Indicates if the subtask input field is currently focused.
   */
  isSubtaskInputFocused: boolean = false;

  /**
   * Reference to the contacts dropdown element.
   */
  @ViewChild('contactsDropdown') contactsDropdown!: ElementRef;
  /**
   * Reference to the element that triggers the contacts dropdown.
   */
  @ViewChild('dropdownTrigger') dropdownTrigger!: ElementRef;
  /**
   * Reference to the category dropdown element.
   */
  @ViewChild('categoryDropdown') categoryDropdown!: ElementRef;
  /**
   * Reference to the element that triggers the category dropdown.
   */
  @ViewChild('categoryDropdownTrigger') categoryDropdownTrigger!: ElementRef;

  /**
   * Constructs the AddtaskComponent.
   * @param firebaseService The FirebaseService for database interactions.
   * @param taskService The TaskService for managing tasks locally.
   * @param router The Router for navigation.
   */
  constructor(
    private firebaseService: FirebaseService,
    private taskService: TaskService,
    private router: Router
  ) {}

  /**
   * Lifecycle hook called once the component is initialized.
   * Subscribes to the contact list from FirebaseService.
   */
  ngOnInit(): void {
    this.contactSubscription = this.firebaseService.contactList.subscribe(
      (contacts) => {
        this.contacts = contacts;
      }
    );
  }

  /**
   * Lifecycle hook called just before the component is destroyed.
   * Unsubscribes from the contact list subscription to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.contactSubscription) {
      this.contactSubscription.unsubscribe();
    }
  }

  /**
   * Creates a new task by sending the newTask object to the FirebaseService.
   * Validates required fields before submission and navigates to the board on success.
   */
  createTask() {
    this.errors.title = !this.newTask.title;
    this.errors.date = !this.newTask.date;
    this.errors.category = !this.newTask.category;

    if (this.errors.title || this.errors.date || this.errors.category) {
      return;
    }

    this.firebaseService.createTask(this.newTask).then(() => {
      this.taskService.addTask(this.newTask);
      this.taskCreated.emit(this.newTask);
      this.resetForm();
      this.router.navigate(['/board']);
    });
  }

  /**
   * Resets the form to its initial state, clearing all input fields and selections.
   */
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

  /**
   * Sets the priority of the new task.
   * @param priority The priority level ('urgent', 'medium', or 'low').
   */
  setPriority(priority: 'urgent' | 'medium' | 'low') {
    this.newTask.priority = priority;
  }

  /**
   * Adds a new subtask to the newTask's subtask array.
   * @param subtaskTitle The title of the new subtask.
   */
  addSubtask(subtaskTitle: string) {
    if (subtaskTitle) {
      this.newTask.subtask?.push({ title: subtaskTitle, completed: false });
    }
  }

  /**
   * Removes a subtask from the newTask's subtask array at the specified index.
   * @param index The index of the subtask to remove.
   */
  removeSubtask(index: number) {
    this.newTask.subtask?.splice(index, 1);
  }

  /**
   * Sets the isEditing flag to true for a given subtask, allowing inline editing.
   * @param subtask The subtask to start editing.
   */
  startEditSubtask(subtask: Subtask) {
    subtask.isEditing = true;
  }

  /**
   * Finishes editing a subtask, saving the changes and removing the subtask if the title is empty.
   * @param subtask The subtask being edited.
   * @param index The index of the subtask in the array.
   */
  finishEditSubtask(subtask: Subtask, index: number) {
    subtask.isEditing = false;
    if (!subtask.title.trim()) {
      this.removeSubtask(index);
    }
  }

  /**
   * Cancels the editing of a subtask, reverting any changes and removing it if the title is empty.
   * @param subtask The subtask being edited.
   * @param index The index of the subtask in the array.
   */
  cancelEditSubtask(subtask: Subtask, index: number) {
    subtask.isEditing = false;
    if (!subtask.title.trim()) {
      this.removeSubtask(index);
    }
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
   * Toggles the visibility of the contacts dropdown.
   */
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Host listener that handles clicks outside the contacts dropdown to close it.
   * @param event The mouse click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isDropdownOpen && this.contactsDropdown && this.dropdownTrigger) {
      if (
        !this.dropdownTrigger.nativeElement.contains(event.target) &&
        !this.contactsDropdown.nativeElement.contains(event.target)
      ) {
        this.isDropdownOpen = false;
      }
    }
    if (
      this.isCategoryDropdownOpen &&
      this.categoryDropdown &&
      this.categoryDropdownTrigger
    ) {
      if (
        !this.categoryDropdownTrigger.nativeElement.contains(event.target) &&
        !this.categoryDropdown.nativeElement.contains(event.target)
      ) {
        this.isCategoryDropdownOpen = false;
      }
    }
  }

  /**
   * Selects or deselects a contact to be assigned to the task.
   * @param contact The contact to toggle selection for.
   */
  selectContact(contact: ContactInterface) {
    if (contact.id) {
      this.selectedContact = contact;
      this.checkedContacts[contact.id] = !this.checkedContacts[contact.id];
    }
  }

  /**
   * Returns an array of contacts that are currently selected to be assigned to the task.
   * Updates the newTask's assignedTo array with the IDs of the selected contacts.
   * @returns An array of selected ContactInterface objects.
   */
  getSelectedContacts(): ContactInterface[] {
    this.newTask.assignedTo = this.contacts
      .filter((contact) => contact.id && this.checkedContacts[contact.id])
      .map((contact) => contact.id!);
    return this.contacts.filter(
      (contact) => contact.id && this.checkedContacts[contact.id]
    );
  }

  /**
   * Returns today's date in the format YYYY-MM-DD.
   * @returns A string representing today's date.
   */
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  /**
   * Toggles the visibility of the category dropdown.
   */
  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  /**
   * Selects a category for the task and closes the dropdown.
   * @param category The selected category.
   */
  selectCategory(category: string | null) {
    this.selectedCategory = category;
    this.newTask.category = category;
    this.isCategoryDropdownOpen = false;
    this.resetError('category');
  }

  /**
   * Resets the error flag for a specific field.
   * @param fieldName The name of the field ('title', 'date', or 'category').
   */
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