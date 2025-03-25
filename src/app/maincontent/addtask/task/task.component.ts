import { Component, OnInit, OnDestroy } from '@angular/core';
import { TaskInterface } from '../task.interface';
import { TaskService } from '../task.service';
import { Subscription } from 'rxjs';
import { ContactInterface } from '../../contacts/contact-interface';
import { FirebaseService } from '../../../shared/services/firebase.service';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent implements OnInit, OnDestroy {
  tasks: TaskInterface[] = [];
  taskSubscription: Subscription | undefined;
  contacts: ContactInterface[] = [];
  contactSubscription: Subscription | undefined;
  isClicked: boolean = false;
  selectedTask: TaskInterface | null = null;

  constructor(
    private taskService: TaskService,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.taskSubscription = this.taskService.tasks$.subscribe((tasks) => {
      this.tasks = tasks;
      console.log('Tasks in TaskComponent:', this.tasks);
    });
    this.contactSubscription = this.firebaseService.contactList.subscribe(
      (contacts) => {
        this.contacts = contacts;
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

  openTaskDetails(task: TaskInterface) {
    this.selectedTask = task;
    this.isClicked = true;
  }

  closeTaskDetails() {
    this.isClicked = false;
    this.selectedTask = null;
  }
}
