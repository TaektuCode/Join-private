import { Component, OnInit, OnDestroy, AfterViewInit, inject, ElementRef } from '@angular/core';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Subscription } from 'rxjs';
import { TaskInterface } from '../addtask/task.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../login/auth.service';
import { LoginStatusService } from './../../login/login-status.service';

/**
 * Component displaying a summary of the user's tasks and a personalized greeting.
 */
@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * The greeting message based on the time of day.
   */
  message: string = '';
  /**
   * The number of tasks with 'Todo' status.
   */
  todoTasksCount: number = 0;
  /**
   * The number of tasks with 'Done' status.
   */
  doneTasksCount: number = 0;
  /**
   * The total number of tasks.
   */
  totalTasksCount: number = 0;
  /**
   * The number of tasks with 'In Progress' status.
   */
  inProgressTasksCount: number = 0;
  /**
   * The number of tasks with 'Await Feedback' status.
   */
  awaitFeedbackTasksCount: number = 0;
  /**
   * The number of tasks with 'urgent' priority.
   */
  urgentTasksCount: number = 0;
  /**
   * The upcoming deadline of an urgent task.
   */
  upcomingDeadline: string = '';
  /**
   * Subscription to the task list observable.
   */
  taskSubscription: Subscription | undefined;
  private authService = inject(AuthService);
  /**
   * The name of the logged-in user. Defaults to 'Gast'.
   */
  userName: string | null | undefined = 'Gast';
  /**
   * Subscription to the user observable.
   */
  userSubscription: Subscription | undefined;
  /**
   * Flag to track if the initial animation has played.
   */
  animationPlayed: boolean = false;
  private loginStatusService = inject(LoginStatusService);
  private el = inject(ElementRef); // Inject ElementRef

  /**
   * Constructs the SummaryComponent and initializes the greeting message based on the current time.
   * @param firebaseService The FirebaseService for accessing task data.
   */
  constructor(private firebaseService: FirebaseService) {
    this.checkTime();
  }

  /**
   * Lifecycle hook called once the component is initialized.
   * Subscribes to the task list and user observables to update the summary data.
   */
  ngOnInit(): void {
    this.taskSubscription = this.firebaseService.taskList$.subscribe((tasks) => {
      this.todoTasksCount = tasks.filter((task) => task.status === 'Todo').length;
      this.doneTasksCount = tasks.filter((task) => task.status === 'Done').length;
      this.totalTasksCount = tasks.length;
      this.inProgressTasksCount = tasks.filter((task) => task.status === 'In Progress').length;
      this.awaitFeedbackTasksCount = tasks.filter((task) => task.status === 'Await Feedback').length;
      this.urgentTasksCount = tasks.filter((task) => task.priority === 'urgent').length;
      this.upcomingDeadline = this.getUpcomingDeadline(tasks);
    });

    this.userSubscription = this.authService.user$.subscribe((user) => {
      if (user && user.displayName) {
        const spaceIndex = user.displayName.indexOf(' ');
        if (spaceIndex !== -1) {
          this.userName = user.displayName.substring(0, spaceIndex);
        } else {
          this.userName = user.displayName;
        }
      }
    });
  }

  /**
   * Lifecycle hook called after the component's view has been fully initialized.
   * Subscribes to the login status and triggers the initial animation if the user is logged in.
   */
  ngAfterViewInit(): void {
    this.loginStatusService.loginStatus$.subscribe((loggedIn) => {
      if (loggedIn && !this.animationPlayed) {
        this.animationPlayed = true;
        const mainContainer = this.el.nativeElement.querySelector('.main-container');
        const helloContainer = this.el.nativeElement.querySelector('.hello-container');

        if (mainContainer) {
          mainContainer.classList.add('animate-once');
        }
        if (helloContainer) {
          helloContainer.classList.add('animate-once');
        }
      }
    });
  }

  /**
   * Lifecycle hook called just before the component is destroyed.
   * Unsubscribes from the task and user observables and resets the login status.
   */
  ngOnDestroy(): void {
    if (this.taskSubscription) {
      this.taskSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    this.loginStatusService.resetLoginStatus();
  }

  /**
   * Checks the current time and sets the greeting message accordingly.
   */
  checkTime(): void {
    const date = new Date();
    const hours = date.getHours();

    this.message =
      hours >= 6 && hours < 11
        ? 'Good Morning'
        : hours >= 11 && hours < 15
          ? 'Good Afternoon'
          : hours >= 15 && hours < 22
            ? 'Good Evening'
            : 'Good Night';
  }

  /**
   * Finds the upcoming deadline of an urgent task.
   * @param tasks An array of TaskInterface objects.
   * @returns A formatted date string of the upcoming urgent deadline, or 'No Urgent Deadline' if none found.
   */
  getUpcomingDeadline(tasks: TaskInterface[]): string {
    if (!tasks || tasks.length === 0) {
      return 'No Deadline';
    }

    const urgentTasks = tasks.filter((task) => task.priority === 'urgent' && task.date);

    if (urgentTasks.length === 0) {
      return 'No Urgent Deadline';
    }

    urgentTasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const dateString = urgentTasks[0].date;
    const dateParts = dateString.split('-');
    return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  }
}