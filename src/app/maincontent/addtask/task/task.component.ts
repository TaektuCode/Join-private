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

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [FormsModule, CommonModule, TruncatePipe],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent implements OnInit, OnDestroy {
  @Input() task!: TaskInterface;
  @Output() taskUpdated = new EventEmitter<TaskInterface>();
  contacts: ContactInterface[] = [];
  contactSubscription: Subscription | undefined;
  isClicked: boolean = false;
  isEditing: boolean = false;
  selectedTask: TaskInterface | null = null;
  isDropdownOpen = false;
  checkedContacts: { [key: string]: boolean } = {};
  editingSubtaskIndex: number | null = null;
  rotateValue: number = 0;

  constructor(private firebaseService: FirebaseService) {}

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

  ngOnDestroy(): void {
    if (this.contactSubscription) {
      this.contactSubscription.unsubscribe();
    }
  }

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

  getAssigneeColor(assigneeId: string): string | undefined {
    const contact = this.contacts.find((contact) => contact.id === assigneeId);
    return contact?.color;
  }

  getAssigneeDetails(assigneeId: string): ContactInterface | undefined {
    return this.contacts.find((contact) => contact.id === assigneeId);
  }

  getSubtaskProgressPercent(task: TaskInterface): number {
    const completed = task.subtask?.filter((sub) => sub.completed).length || 0;
    const total = task.subtask?.length || 1;
    return (completed / total) * 100;
  }

  getSubtaskProgressText(task: TaskInterface): string {
    const completed = task.subtask?.filter((sub) => sub.completed).length || 0;
    const total = task.subtask?.length || 0;
    return `${completed}/${total} Subtasks`;
  }

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

  closeTaskDetails() {
    this.isClicked = false;
    this.selectedTask = null;
    this.isEditing = false;
    this.isDropdownOpen = false;
  }

  startEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    this.selectedTask = null;
  }

  saveTaskDetails() {
    if (this.selectedTask && this.selectedTask.id) {
      const updatedTaskData: Partial<TaskInterface> = {
        title: this.selectedTask.title,
        description: this.selectedTask.description,
        date: this.selectedTask.date,
        priority: this.selectedTask.priority,
        assignedTo: this.getSelectedContacts().map((contact) => contact.id!), // Aktualisieren Sie assignedTo basierend auf checkedContacts
        subtask: this.selectedTask.subtask,
        edited: new Date(),
      };

      this.firebaseService
        .updateTask(this.selectedTask.id, updatedTaskData)
        .then(() => {
          console.log(
            `Task mit ID ${this.selectedTask?.id} erfolgreich aktualisiert.`
          );
          this.isEditing = false;
          this.isClicked = false;
          this.selectedTask = null;
          this.taskUpdated.emit({ ...this.task, ...updatedTaskData });
        })
        .catch((error) => {
          console.error('Fehler beim Aktualisieren des Tasks:', error);
        });
    }
  }

  addSubtask(title: string) {
    if (title && this.selectedTask) {
      this.selectedTask.subtask = this.selectedTask.subtask || [];
      this.selectedTask.subtask.push({ title: title, completed: false });
    }
  }

  // rotateCard(event: Event, add: boolean): void {
  //   const cardElement = event.currentTarget as HTMLElement;
  //   if (add) {
  //     cardElement.classList.add('rotated');
  //   } else {
  //     cardElement.classList.remove('rotated');
  //   }
  // }

  rotateCard(event: Event, add: boolean): void {
    this.rotateValue = add ? 5 : 0;
  }

  // @HostListener('cdkDragStarted', ['$event'])
  // onDragStarted(event: Event): void {
  //   this.rotateCard(event, true);
  // }

  // @HostListener('cdkDragEnded', ['$event'])
  // onDragEnded(event: Event): void {
  //   this.rotateCard(event, false);
  // }

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

  deleteTask() {
    if (this.selectedTask && this.selectedTask.id) {
      this.firebaseService
        .deleteTask(this.selectedTask.id)
        .then(() => {
          console.log(`Task with ID ${this.selectedTask?.id} deleted.`);
          this.isClicked = false;
          this.selectedTask = null;
          this.taskUpdated.emit();
        })
        .catch((error) => {
          console.error('Error cant delete SelectedTask:', error);
        });
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectContact(contact: ContactInterface) {
    if (contact.id) {
      this.checkedContacts[contact.id] = !this.checkedContacts[contact.id];
    }
  }

  getSelectedContacts(): ContactInterface[] {
    return this.contacts.filter(
      (contact) => contact.id && this.checkedContacts[contact.id]
    );
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

  editSubtask(index: number) {
    if (this.editingSubtaskIndex === index) {
      this.editingSubtaskIndex = null; // Speichern, wenn bereits im Bearbeitungsmodus
    } else {
      this.editingSubtaskIndex = index; // Bearbeitungsmodus starten
    }
  }

  saveSubtask(subtask: any, index: number) {
    this.editingSubtaskIndex = null;
    this.updateSubtaskInFirebase(subtask, index);
  }

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
          console.error('Fehler beim Aktualisieren des Subtasks:', error);
        });
    }
  }

  deleteSubtask(index: number) {
    if (
      this.selectedTask &&
      this.selectedTask.id &&
      this.selectedTask.subtask
    ) {
      this.selectedTask.subtask.splice(index, 1); // Subtask aus dem Array entfernen
      this.updateSubtaskInFirebase(this.selectedTask.subtask, -1);
    }
  }
}
