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

/**
 * Component for displaying and managing tasks in a board view with drag and drop functionality.
 */
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
  /**
   * Array to hold all tasks.
   */
  tasks: TaskInterface[] = [];
  /**
   * Array to hold tasks with 'Todo' status.
   */
  todo: TaskInterface[] = [];
  /**
   * Array to hold tasks with 'In Progress' status.
   */
  inProgress: TaskInterface[] = [];
  /**
   * Array to hold tasks with 'Await Feedback' status.
   */
  awaitFeedback: TaskInterface[] = [];
  /**
   * Array to hold tasks with 'Done' status.
   */
  done: TaskInterface[] = [];
  /**
   * Subscription to the task list observable from FirebaseService.
   */
  taskSubscription: Subscription | undefined;
  /**
   * Array to hold contacts.
   */
  contacts: ContactInterface[] = [];
  /**
   * Subscription to the contact list observable from FirebaseService.
   */
  contactSubscription: Subscription | undefined;
  /**
   * Controls the visibility of the add task overlay.
   */
  isAddTaskOverlayVisible: boolean = false;
  /**
   * Term used to filter tasks.
   */
  searchTerm: string = '';
  /**
   * Stores all tasks fetched from Firebase.
   */
  allTasks: TaskInterface[] = [];

  /**
   * Constructs the BoardComponent.
   * @param firebaseService The FirebaseService for interacting with the database.
   */
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Lifecycle hook called once the component is initialized.
   * Subscribes to the task and contact lists from FirebaseService.
   */
  ngOnInit(): void {
    this.taskSubscription = this.firebaseService.taskList$.subscribe(
      (tasks) => {
        this.allTasks = tasks; // Store all tasks
        this.filterTasks();
      }
    );
    this.contactSubscription = this.firebaseService.contactList.subscribe(
      (contacts) => {
        this.contacts = contacts;
      }
    );
  }

  /**
   * Lifecycle hook called just before the component is destroyed.
   * Unsubscribes from the task and contact list subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.taskSubscription) {
      this.taskSubscription.unsubscribe();
    }
    if (this.contactSubscription) {
      this.contactSubscription.unsubscribe();
    }
  }

  /**
   * Filters an array of tasks based on their status.
   * @param tasksToFilter The array of TaskInterface objects to filter.
   * @returns An object containing arrays of tasks for each status ('todo', 'inProgress', 'awaitFeedback', 'done').
   */
  filterTasksByStatus(
    tasksToFilter: TaskInterface[]
  ): {
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
    return { todo, inProgress, awaitFeedback, done }; // Important: return the object
  }

  /**
   * Filters the allTasks array based on the searchTerm and updates the todo, inProgress, awaitFeedback, and done arrays.
   */
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

  /**
   * Determines the new status of a task based on the ID of the drop container.
   * @param containerId The ID of the container where the task was dropped.
   * @returns The new status ('Todo', 'In Progress', 'Await Feedback', 'Done') or null if not recognized.
   */
  getNewStatusFromContainerId(containerId: string): 'Todo' | 'In Progress' | 'Await Feedback' | 'Done' | null {
    if (containerId === 'todoList') {
      return 'Todo';
    } else if (containerId === 'inProgressList') {
      return 'In Progress';
    } else if (containerId === 'awaitFeedbackList') {
      return 'Await Feedback';
    } else if (containerId === 'doneList') {
      return 'Done';
    } else {
      return null;
    }
  }

  /**
   * Handles the drop event when a task is dragged and dropped into a different list.
   * Updates the task's status in Firebase based on the new container.
   * @param event The CdkDragDrop event.
   */
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
      const movedTask = event.item.data; // RICHTIG: Verwenden Sie die Daten des gezogenen Elements
      if (movedTask.id) {
        const newStatus = this.getNewStatusFromContainerId(event.container.id);
        if (newStatus && movedTask.id) {
          this.firebaseService.updateTask(movedTask.id, { status: newStatus });
        }
      }
    }
  }
  // drop(event: CdkDragDrop<TaskInterface[]>) {
  //   if (event.previousContainer === event.container) {
  //     moveItemInArray(
  //       event.container.data,
  //       event.previousIndex,
  //       event.currentIndex
  //     );
  //   } else {
  //     transferArrayItem(
  //       event.previousContainer.data,
  //       event.container.data,
  //       event.previousIndex,
  //       event.currentIndex
  //     );
  //     const movedTask = event.container.data[event.currentIndex];
  //     if (movedTask.id) {
  //       const newStatus = this.getNewStatusFromContainerId(event.container.id);
  //       if (newStatus && movedTask.id) {
  //         this.firebaseService.updateTask(movedTask.id, { status: newStatus });
  //       }
  //     }
  //   }
  // }

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
   * Opens the add task overlay.
   */
  openAddTaskOverlay() {
    this.isAddTaskOverlayVisible = true;
  }

  /**
   * Closes the add task overlay.
   */
  closeAddTaskOverlay() {
    this.isAddTaskOverlayVisible = false;
  }

  /**
   * Handles the event when a new task is created in the add task overlay.
   * The task list is updated via the Firebase observable, so no direct action is needed here.
   * @param newTask The newly created TaskInterface object.
   */
  handleTaskCreated(newTask: TaskInterface) {
    this.closeAddTaskOverlay();
  }
}