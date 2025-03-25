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

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CommonModule, TaskComponent],
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

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.taskSubscription = this.firebaseService.taskList$.subscribe(
      (tasks) => {
        this.tasks = tasks;
        console.log('Alle Tasks in BoardComponent:', this.tasks);
        this.filterTasksByStatus();
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

  filterTasksByStatus(): void {
    this.todo = this.tasks.filter((task) => task.status === 'Todo');
    this.inProgress = this.tasks.filter(
      (task) => task.status === 'In Progress'
    );
    this.awaitFeedback = this.tasks.filter(
      (task) => task.status === 'Await Feedback'
    );
    this.done = this.tasks.filter((task) => task.status === 'Done');

    console.log('Todo-Tasks:', this.todo); // Überprüfe die gefilterten Todo-Tasks
    console.log('In Progress-Tasks:', this.inProgress); // Überprüfe die gefilterten In Progress-Tasks
    console.log('Await Feedback-Tasks:', this.awaitFeedback); // Überprüfe die gefilterten Await Feedback-Tasks
    console.log('Done-Tasks:', this.done); // Überprüfe die gefilterten Done-Tasks
  }

  drop(event: CdkDragDrop<TaskInterface[]>) {
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
      if (movedTask.id) {
        let newCategory: string | null = null;
        if (event.container.id === 'todoList') {
          newCategory = 'Todo';
        } else if (event.container.id === 'inProgressList') {
          newCategory = 'In Progress';
        } else if (event.container.id === 'awaitFeedbackList') {
          newCategory = 'Await Feedback';
        } else if (event.container.id === 'doneList') {
          newCategory = 'Done';
        }
        if (newCategory) {
          this.firebaseService.updateTask(movedTask.id, {
            ...movedTask,
            category: newCategory,
          });
        }
      }
    }
  }

  trackByFn(index: number, item: TaskInterface): string | undefined {
    return item.id;
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
}
