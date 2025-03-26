import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../shared/services/firebase.service';
import { TaskInterface } from '../addtask/task.interface';
import { Subscription } from 'rxjs';
import { ContactInterface } from '../contacts/contact-interface';
import { TaskComponent } from '../addtask/task/task.component';
import { AddtaskComponent } from '../addtask/addtask.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    CommonModule,
    TaskComponent,
    AddtaskComponent,
    FormsModule,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit, OnDestroy {
  tasks: TaskInterface[] = [];
  todo: TaskInterface[] = [];
  inProgress: TaskInterface[] = [];
  awaitFeedback: TaskInterface[] = [];
  done: TaskInterface[] = [];
  taskSubscription: Subscription | undefined;
  contacts: ContactInterface[] = []; // Property für Kontakte
  contactSubscription: Subscription | undefined;
  isAddTaskOverlayVisible: boolean = false;
  searchTerm: string = '';
  allTasks: TaskInterface[] = [];

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.taskSubscription = this.firebaseService.taskList$.subscribe(
      (tasks) => {
        this.allTasks = tasks; // Speichert alle Aufgaben
        console.log('Alle Tasks in BoardComponent:', this.allTasks);
        this.filterTasks();
      }
    );
    this.contactSubscription = this.firebaseService.contactList.subscribe(
      (contacts) => {
        this.contacts = contacts;
        console.log('Kontakte in BoardComponent:', this.contacts);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.taskSubscription) {
      this.taskSubscription.unsubscribe();
    }
    if (this.contactSubscription) {
      this.contactSubscription.unsubscribe();
    }
  }

  filterTasksByStatus(tasksToFilter: TaskInterface[]): {
    todo: TaskInterface[];
    inProgress: TaskInterface[];
    awaitFeedback: TaskInterface[];
    done: TaskInterface[];
  } {
    const todo = tasksToFilter.filter((task) => task.status === 'Todo');
    const inProgress = tasksToFilter.filter(
      (task) => task.status === 'In Progress'
    );
    const awaitFeedback = tasksToFilter.filter(
      (task) => task.status === 'Await Feedback'
    );
    const done = tasksToFilter.filter((task) => task.status === 'Done');
    return { todo, inProgress, awaitFeedback, done }; // Wichtig! Das Objekt zurückgeben
  }

  filterTasks(): void {
    const lowerSearchTerm = this.searchTerm.toLowerCase();

    const filteredTasks = this.allTasks.filter((task) => {
      const titleMatch =
        task.title && task.title.toLowerCase().includes(lowerSearchTerm);
      const descriptionMatch =
        task.description &&
        task.description.toLowerCase().includes(lowerSearchTerm);
      return titleMatch || descriptionMatch;
    });

    const { todo, inProgress, awaitFeedback, done } =
      this.filterTasksByStatus(filteredTasks);
    this.todo = todo;
    this.inProgress = inProgress;
    this.awaitFeedback = awaitFeedback;
    this.done = done;
  }

  drop(event: CdkDragDrop<TaskInterface[]>) {
    console.log('drop-Methode aufgerufen:', event);
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const movedTask = event.container.data[event.currentIndex];
      console.log('Verschobener Task:', movedTask);
      console.log('Ziel-Container-ID:', event.container.id); // Überprüfen Sie die ID des Containers, in den verschoben wurde
      if (movedTask.id) {
        let newStatus:
          | 'Todo'
          | 'In Progress'
          | 'Await Feedback'
          | 'Done'
          | null = null;
        if (event.container.id === 'todoList') {
          newStatus = 'Todo';
        } else if (event.container.id === 'inProgressList') {
          newStatus = 'In Progress';
        } else if (event.container.id === 'awaitFeedbackList') {
          newStatus = 'Await Feedback';
        } else if (event.container.id === 'doneList') {
          newStatus = 'Done';
        }

        if (newStatus && movedTask.id) {
          this.firebaseService.updateTask(movedTask.id, { status: newStatus });
        }
      }
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

  openAddTaskOverlay() {
    this.isAddTaskOverlayVisible = true;
  }

  closeAddTaskOverlay() {
    this.isAddTaskOverlayVisible = false;
  }

  handleTaskCreated(newTask: TaskInterface) {
    console.log('Neue Aufgabe vom Overlay erhalten:', newTask);
    // Da `this.tasks` über das Firebase-Observable `taskList$` aktualisiert wird,
    // müssen wir die neu erstellte Aufgabe nicht direkt zu `this.tasks` hinzufügen.
    // Firebase aktualisiert die Liste und unser Observable löst eine neue Emission aus,
    // wodurch `filterTasksByStatus()` erneut aufgerufen und die lokalen Arrays
    // (`todo`, `inProgress`, etc.) aktualisiert werden.

    // Optional: Zeige eine Erfolgsmeldung an
    this.closeAddTaskOverlay();
  }
}
