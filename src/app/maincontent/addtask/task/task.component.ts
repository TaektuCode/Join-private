import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { TaskInterface } from '../task.interface';
import { ContactInterface } from '../../contacts/contact-interface';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../../truncate.pipe';
import { CdkDragDrop, CdkDragStart, CdkDragEnd } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';

/**
 * Component to display and manage a single task.
 */
@Component({
  selector: 'app-task',
  standalone: true,
  imports: [FormsModule, CommonModule, TruncatePipe, DragDropModule],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent implements OnInit, OnDestroy {
  /**
   * The task object to be displayed and managed.
   */
  @Input() task!: TaskInterface;
  /**
   * Emits the updated task object when changes are saved or when the task is deleted.
   */
  @Output() taskUpdated = new EventEmitter<TaskInterface | void>();
  /**
   * Array of contacts available to assign to the task.
   */
  contacts: ContactInterface[] = [];
  /**
   * Subscription to the contact list observable.
   */
  contactSubscription: Subscription | undefined;
  /**
   * Flag indicating if the task details are currently expanded.
   */
  isClicked: boolean = false;
  /**
   * Flag indicating if the task is currently being edited.
   */
  isEditing: boolean = false;
  /**
   * The currently selected task for detailed view or editing.
   */
  selectedTask: TaskInterface | null = null;
  /**
   * Controls the visibility of the assignee dropdown.
   */
  isDropdownOpen = false;
  /**
   * Object to track the checked state of contacts for assignment.
   */
  checkedContacts: { [key: string]: boolean } = {};
  /**
   * Index of the subtask currently being edited.
   */
  editingSubtaskIndex: number | null = null;
  /**
   * Value for rotating the task card during drag operations.
   */
  rotateValue: number = 0;
  /**
   * Controls the visibility of the delete confirmation dialog.
   */
  showDeleteConfirmation: boolean = false;
  /**
   * Controls the visibility of the drop zone indicator.
   */
  showDropZone: boolean = false;

  /**
   * Constructs the TaskComponent.
   * @param firebaseService The FirebaseService for database interactions.
   */
  constructor(private firebaseService: FirebaseService) { }

  /**
   * Lifecycle hook called once the component is initialized.
   * Subscribes to the contact list and initializes the checked contacts based on assigned users.
   */
  ngOnInit(): void {
    this.contactSubscription = this.firebaseService.contactList.subscribe(
      (contacts) => {
        this.contacts = contacts;
        if (this.task && this.task.assignedTo) {
          this.task.assignedTo.forEach((contactId) => {
            this.checkedContacts[contactId] = true;
          });
        }
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
   * Returns the initials of an assignee based on their ID.
   * @param assigneeId The ID of the assigned contact.
   * @returns A string containing the uppercase initials of the assignee's name, or an empty string if not found.
   */
  getAssigneeInitials(assigneeId: string): string {
    const contact = this.contacts.find((c) => c.id === assigneeId);
    if (contact) {
      const names = contact.name.trim().split(' ');
      if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
      }
      const firstNameInitial = names[0].charAt(0).toUpperCase();
      const lastNameInitial = names[names.length - 1].charAt(0).toUpperCase();
      return firstNameInitial + lastNameInitial;
    }
    return '';
  }

  /**
   * Returns the color of an assignee based on their ID.
   * @param assigneeId The ID of the assigned contact.
   * @returns The color of the contact, or undefined if not found.
   */
  getAssigneeColor(assigneeId: string): string | undefined {
    const contact = this.contacts.find((contact) => contact.id === assigneeId);
    return contact?.color;
  }

  /**
   * Returns the full details of an assignee based on their ID.
   * @param assigneeId The ID of the assigned contact.
   * @returns The ContactInterface object, or undefined if not found.
   */
  getAssigneeDetails(assigneeId: string): ContactInterface | undefined {
    return this.contacts.find((contact) => contact.id === assigneeId);
  }

  /**
   * Calculates the progress percentage of completed subtasks.
   * @param task The TaskInterface object.
   * @returns A number representing the percentage of completed subtasks.
   */
  getSubtaskProgressPercent(task: TaskInterface): number {
    const completed = task.subtask?.filter((sub) => sub.completed).length || 0;
    const total = task.subtask?.length || 1;
    return (completed / total) * 100;
  }

  /**
   * Returns a string indicating the number of completed subtasks out of the total.
   * @param task The TaskInterface object.
   * @returns A string in the format 'completed/total Subtasks'.
   */
  getSubtaskProgressText(task: TaskInterface): string {
    const completed = task.subtask?.filter((sub) => sub.completed).length || 0;
    const total = task.subtask?.length || 0;
    return `${completed}/${total} Subtasks`;
  }

  /**
   * Opens the task details view, initializing the selected task and checked contacts.
   */
  openTaskDetails() {
    this.selectedTask = { ...this.task };
    this.isClicked = true;
    this.checkedContacts = {};
    if (this.selectedTask && this.selectedTask.assignedTo) {
      this.selectedTask.assignedTo.forEach((contactId) => {
        this.checkedContacts[contactId] = true;
      });
    }
  }

  /**
   * Closes the task details view and resets related flags and the selected task.
   */
  closeTaskDetails() {
    this.isClicked = false;
    this.selectedTask = null;
    this.isEditing = false;
    this.isDropdownOpen = false;
  }

  /**
   * Sets the component to editing mode.
   */
  startEditing() {
    this.isEditing = true;
  }

  /**
   * Cancels the editing mode and resets the selected task.
   */
  cancelEditing() {
    this.isEditing = false;
    this.selectedTask = null;
  }

  /**
   * Saves the updated task details to Firebase.
   */
  saveTaskDetails() {
    if (this.selectedTask && this.selectedTask.id) {
      const updatedTaskData: Partial<TaskInterface> = {
        title: this.selectedTask.title,
        description: this.selectedTask.description,
        date: this.selectedTask.date,
        priority: this.selectedTask.priority,
        assignedTo: this.getSelectedContacts().map((contact) => contact.id!),
        subtask: this.selectedTask.subtask,
        edited: new Date(),
      };

      this.updateTaskInFirebase(this.selectedTask.id, updatedTaskData);
    }
  }

  /**
   * Updates a task in the Firebase database.
   * Upon successful update, UI states are reset, and an event with the updated data is emitted.
   * If an error occurs, it is logged to the console and re-thrown.
   *
   * @param taskId The ID of the task to be updated.
   * @param updatedTaskData A partial object containing the fields of the task to be updated.
   * @returns A Promise that resolves if the update was successful, and rejects if an error occurred.
   */
  updateTaskInFirebase(taskId: string, updatedTaskData: Partial<TaskInterface>) {
    return this.firebaseService
      .updateTask(taskId, updatedTaskData)
      .then(() => {
        this.isEditing = false;
        this.isClicked = false;
        this.selectedTask = null;
        this.taskUpdated.emit({ ...this.task, ...updatedTaskData });
      })
      .catch((error) => {
        console.error('Error updating task:', error);
        throw error;
      });
  }

  /**
   * Adds a new subtask to the selected task.
   * @param title The title of the new subtask.
   */
  addSubtask(title: string) {
    if (title && this.selectedTask) {
      this.selectedTask.subtask = this.selectedTask.subtask || [];
      this.selectedTask.subtask.push({ title: title, completed: false });
    }
  }

  /**
   * Rotates the task card visually during drag operations.
   * @param event The drag start or end event.
   * @param add A boolean indicating whether to add or remove rotation.
   */
  rotateCard(event: Event | CdkDragStart<any> | CdkDragEnd<any>, add: boolean): void {
    this.rotateValue = add ? 5 : 0;
  }

  /**
   * Updates the completion status of a subtask in the selected task and saves it to Firebase.
   * @param subtask The subtask to update.
   * @param event The checkbox change event.
   */
  updateSubtaskStatus(subtask: any, event: any) {
    if (this.selectedTask && this.selectedTask.id) {
      const isChecked = event.target.checked;
      subtask.completed = isChecked;

      const updatedTaskData: Partial<TaskInterface> = {
        subtask: this.selectedTask.subtask,
      };

      this.firebaseService
        .updateTask(this.selectedTask.id, updatedTaskData)
        .then(() => {
          this.taskUpdated.emit({ ...this.task, ...updatedTaskData });
        })
        .catch((error) => {
          console.error('Error Updating Subtask Status:', error);
        });
    }
  }

  /**
   * Opens the delete confirmation dialog.
   */
  openDeleteConfirmation() {
    this.showDeleteConfirmation = true;
  }

  /**
   * Closes the delete confirmation dialog without deleting the task.
   */
  cancelDelete() {
    this.showDeleteConfirmation = false;
  }

  /**
   * Confirms the deletion of the task and calls the deleteTask method.
   */
  confirmDelete() {
    this.showDeleteConfirmation = false;
    this.deleteTask();
  }

  /**
   * Deletes the current task from Firebase.
   */
  deleteTask() {
    if (this.selectedTask && this.selectedTask.id) {
      this.firebaseService
        .deleteTask(this.selectedTask.id)
        .then(() => {
          this.isClicked = false;
          this.selectedTask = null;
          this.taskUpdated.emit();
        })
        .catch((error) => {
          console.error('Error deleting SelectedTask:', error);
        });
    }
  }

  /**
   * Toggles the visibility of the assignee dropdown.
   */
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Selects or deselects a contact to be assigned to the task.
   * @param contact The contact to toggle selection for.
   */
  selectContact(contact: ContactInterface) {
    if (contact.id) {
      this.checkedContacts[contact.id] = !this.checkedContacts[contact.id];
    }
  }

  /**
   * Returns an array of contacts that are currently selected to be assigned to the task.
   * @returns An array of selected ContactInterface objects.
   */
  getSelectedContacts(): ContactInterface[] {
    return this.contacts.filter(
      (contact) => contact.id && this.checkedContacts[contact.id]
    );
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
   * Sets the editingSubtaskIndex to the index of the subtask being edited.
   * If the same index is clicked again, it exits edit mode.
   * @param index The index of the subtask to edit.
   */
  editSubtask(index: number) {
    if (this.editingSubtaskIndex === index) {
      this.editingSubtaskIndex = null; // Save if already in edit mode
    } else {
      this.editingSubtaskIndex = index; // Start edit mode
    }
  }

  /**
   * Saves the edited subtask and exits edit mode.
   * @param subtask The updated subtask object.
   * @param index The index of the subtask in the array.
   */
  saveSubtask(subtask: any, index: number) {
    this.editingSubtaskIndex = null;
    this.updateSubtaskInFirebase(subtask, index);
  }

  /**
   * Updates a subtask in Firebase.
   * @param subtask The updated subtask object.
   * @param index The index of the subtask in the array.
   */
  updateSubtaskInFirebase(subtask: any, index: number) {
    if (this.selectedTask && this.selectedTask.id) {
      const updatedSubtasks = this.selectedTask.subtask
        ? [...this.selectedTask.subtask]
        : [];
      updatedSubtasks[index] = subtask;

      const updatedTaskData: Partial<TaskInterface> = {
        subtask: updatedSubtasks,
      };

      this.firebaseService
        .updateTask(this.selectedTask.id, updatedTaskData)
        .then(() => {
          this.taskUpdated.emit({ ...this.task, ...updatedTaskData });
        })
        .catch((error) => {
          console.error('Error updating subtask:', error);
        });
    }
  }

  /**
   * Deletes a subtask from the selected task and updates Firebase.
   * @param index The index of the subtask to delete.
   */
  deleteSubtask(index: number) {
    if (
      this.selectedTask &&
      this.selectedTask.id &&
      this.selectedTask.subtask
    ) {
      this.selectedTask.subtask.splice(index, 1); // Remove subtask from array
      this.updateSubtaskInFirebase(this.selectedTask.subtask, -1);
    }
  }

  /**
   * Called when a draggable element enters the drop zone.
   * @param event The drag enter event.
   */
  onDropZoneEntered(event: any): void {
    this.showDropZone = true;
  }

  /**
   * Called when a draggable element leaves the drop zone.
   * @param event The drag leave event.
   */
  onDropZoneExited(event: any): void {
    this.showDropZone = false;
  }

  /**
   * Called when a draggable element is dropped onto the drop zone.
   * @param event The drag drop event.
   */
  onDrop(event: CdkDragDrop<any>): void {
    this.showDropZone = false;
  }
}