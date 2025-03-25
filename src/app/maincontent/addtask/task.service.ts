import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TaskInterface } from './task.interface';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private tasksSource = new BehaviorSubject<TaskInterface[]>([]);
  tasks$: Observable<TaskInterface[]> = this.tasksSource.asObservable();

  addTask(task: TaskInterface) {
    const currentTasks = this.tasksSource.getValue();
    this.tasksSource.next([...currentTasks, task]);
  }

  getTasks(): TaskInterface[] {
    return this.tasksSource.getValue();
  }
}
