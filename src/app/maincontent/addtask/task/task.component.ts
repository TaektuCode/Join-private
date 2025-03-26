import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { TaskInterface } from '../task.interface';
import { ContactInterface } from '../../contacts/contact-interface';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent implements OnInit, OnDestroy {
  @Input() task!: TaskInterface; // Input-Property für den Task
  @Output() taskUpdated = new EventEmitter<TaskInterface>(); // Output-Event für aktualisierte Tasks (optional)
  contacts: ContactInterface[] = [];
  contactSubscription: Subscription | undefined;
  isClicked: boolean = false;
  isEditing: boolean = false;
  selectedTask: TaskInterface | null = null;

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
    this.selectedTask = { ...this.task }; // Erstelle eine tiefe Kopie
    this.isClicked = true;
  }

  closeTaskDetails() {
    this.isClicked = false;
    this.selectedTask = null;
    this.isEditing = false;
  }

  startEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    this.selectedTask = null; // Setze selectedTask zurück, um Änderungen zu verwerfen
  }

  saveTaskDetails() {
    if (this.selectedTask && this.selectedTask.id) {
      const updatedTaskData: Partial<TaskInterface> = {
        title: this.selectedTask.title,
        description: this.selectedTask.description,
        date: this.selectedTask.date,
        priority: this.selectedTask.priority,
        assignedTo: this.selectedTask.assignedTo,
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
          this.taskUpdated.emit({ ...this.task, ...updatedTaskData }); // Optional: Event auslösen
        })
        .catch((error) => {
          console.error('Fehler beim Aktualisieren des Tasks:', error);
          // Hier könntest du eine Fehlermeldung für den Benutzer anzeigen
        });
    }
  }

  addSubtask(title: string) {
    if (title && this.selectedTask) {
      this.selectedTask.subtask = this.selectedTask.subtask || [];
      this.selectedTask.subtask.push({ title: title, completed: false });
    }
  }
}
