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
  doneTasksCount: number = 0; // Füge diese Zeile hinzu
  taskSubscription: Subscription | undefined;

  constructor(private firebaseService: FirebaseService) {
    this.checkTime();
  }

  ngOnInit(): void {
    this.taskSubscription = this.firebaseService.taskList$.subscribe(tasks => {
      this.todoTasksCount = tasks.filter(task => task.status === 'Todo').length;
      this.doneTasksCount = tasks.filter(task => task.status === 'Done').length; // Füge diese Zeile hinzu
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
}