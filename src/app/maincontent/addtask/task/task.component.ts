import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { TaskInterface } from '../task.interface';
import { ContactInterface } from '../../contacts/contact-interface';
import { FirebaseService } from '../../../shared/services/firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent implements OnInit, OnDestroy {
  @Input() task!: TaskInterface; // Input-Property für den Task
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
    this.selectedTask = this.task;
    this.isClicked = true;
  }

  closeTaskDetails() {
    this.isClicked = false;
    this.selectedTask = null;
    this.isEditing = false; // Bearbeitungsmodus schließen, wenn Details geschlossen werden
  }

  startEditing() {
    this.isEditing = true;
  }

  triggerAnimation(event: MouseEvent) {
    const cardElement = event.currentTarget as HTMLElement;
    cardElement.classList.add('rotate-animation');
    setTimeout(() => {
      cardElement.classList.remove('rotate-animation');
    }, 600);
  }
}

