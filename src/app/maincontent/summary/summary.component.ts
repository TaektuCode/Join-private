import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Subscription } from 'rxjs';
import { TaskInterface } from '../addtask/task.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent implements OnInit, OnDestroy {
  message: string = '';
  todoTasksCount: number = 0;
  doneTasksCount: number = 0;
  totalTasksCount: number = 0;
  inProgressTasksCount: number = 0;
  awaitFeedbackTasksCount: number = 0;
  urgentTasksCount: number = 0;
  upcomingDeadline: string = '';
  taskSubscription: Subscription | undefined;

  constructor(private firebaseService: FirebaseService) {
    this.checkTime();
  }

  ngOnInit(): void {
    this.taskSubscription = this.firebaseService.taskList$.subscribe(tasks => {
      this.todoTasksCount = tasks.filter(task => task.status === 'Todo').length;
      this.doneTasksCount = tasks.filter(task => task.status === 'Done').length;
      this.totalTasksCount = tasks.length;
      this.inProgressTasksCount = tasks.filter(task => task.status === 'In Progress').length;
      this.awaitFeedbackTasksCount = tasks.filter(task => task.status === 'Await Feedback').length;
      this.urgentTasksCount = tasks.filter(task => task.priority === 'urgent').length;
      this.upcomingDeadline = this.getUpcomingDeadline(tasks);
    });
  }

  ngOnDestroy(): void {
    if (this.taskSubscription) {
      this.taskSubscription.unsubscribe();
    }
  }

  checkTime(): void {
    const date = new Date();
    const hours = date.getHours();

    this.message =
      hours >= 6 && hours < 11 ? 'Good Morning' :
        hours >= 11 && hours < 15 ? 'Good Afternoon' :
          hours >= 15 && hours < 22 ? 'Good Evening' :
            'Good Night';
  }

  getUpcomingDeadline(tasks: TaskInterface[]): string {
    if (!tasks || tasks.length === 0) {
      return 'No Deadline';
    }

    const urgentTasks = tasks.filter(task => task.priority === 'urgent' && task.date);

    if (urgentTasks.length === 0) {
      return 'No Urgent Deadline';
    }

    urgentTasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const dateString = urgentTasks[0].date;
    const dateParts = dateString.split('-');
    return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  }
}