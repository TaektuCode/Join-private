import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TaskInterface } from './task.interface';

/**
 * A service for managing a list of tasks.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private tasksSource = new BehaviorSubject<TaskInterface[]>([]);
  /**
   * An Observable that emits the current array of tasks.
   */
  tasks$: Observable<TaskInterface[]> = this.tasksSource.asObservable();

  /**
   * Adds a new task to the list of tasks.
   * @param task The TaskInterface object to add.
   */
  addTask(task: TaskInterface): void {
    const currentTasks = this.tasksSource.getValue();
    this.tasksSource.next([...currentTasks, task]);
  }

  /**
   * Retrieves the current array of tasks.
   * @returns An array of TaskInterface objects.
   */
  getTasks(): TaskInterface[] {
    return this.tasksSource.getValue();
  }
}