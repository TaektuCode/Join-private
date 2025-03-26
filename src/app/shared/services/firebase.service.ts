import { Injectable, inject, OnDestroy } from '@angular/core';
import {
  collection,
  Firestore,
  onSnapshot,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
} from '@angular/fire/firestore';
import { ContactInterface } from '../../maincontent/contacts/contact-interface';
import { TaskInterface } from '../../maincontent/addtask/task.interface';
import { Unsubscribe } from '@angular/fire/auth';
import { Observable, BehaviorSubject, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService implements OnDestroy {
  firebase = inject(Firestore);
  unsubscribeTasks: Unsubscribe | undefined;
  unsubscribeContacts: Unsubscribe | undefined;
  private _taskList = new BehaviorSubject<TaskInterface[]>([]); // BehaviorSubject für Tasks
  taskList$: Observable<TaskInterface[]> = this._taskList.asObservable(); // Observable für Tasks
  private _contactList = new BehaviorSubject<ContactInterface[]>([]);
  contactList: Observable<ContactInterface[]> =
    this._contactList.asObservable();

  constructor() {
    this.subscribeToContacts();
    this.subscribeToTasks();
  }

  private subscribeToContacts() {
    this.unsubscribeContacts = onSnapshot(
      collection(this.firebase, 'contacts'),
      (contactsObject) => {
        const sortedContacts: ContactInterface[] = [];
        contactsObject.forEach((element) => {
          sortedContacts.push(
            this.setContactObject(
              element.id,
              element.data() as ContactInterface
            )
          );
        });
        sortedContacts.sort((a, b) => a.name.localeCompare(b.name));
        this._contactList.next(sortedContacts);
      }
    );
  }

  private subscribeToTasks() {
    this.unsubscribeTasks = onSnapshot(
      collection(this.firebase, 'tasks'),
      (tasksObject) => {
        const sortedTasks: TaskInterface[] = [];
        tasksObject.forEach((element) => {
          sortedTasks.push(
            this.setTaskObject(element.id, element.data() as TaskInterface)
          );
        });
        this._taskList.next(sortedTasks); // Verwenden Sie _taskList.next()
      }
    );
  }

  setContactObject(id: string, obj: ContactInterface): ContactInterface {
    return {
      id: id,
      email: obj.email,
      name: obj.name,
      phone: obj.phone,
      color: obj.color,
    };
  }

  setTaskObject(id: string, obj: TaskInterface): TaskInterface {
    return {
      id: id,
      title: obj.title,
      date: obj.date,
      category: obj.category,
      description: obj.description,
      assignedTo: obj.assignedTo || [],
      created: obj.created ? obj.created : undefined,
      edited: obj.edited ? obj.edited : undefined,
      priority: obj.priority,
      subtask: obj.subtask || [],
      status: obj.status,
    };
  }

  getGroupedContacts(): Observable<
    { letter: string; contacts: ContactInterface[] }[]
  > {
    return this.contactList.pipe(
      map((contacts) => {
        const grouped: { letter: string; contacts: ContactInterface[] }[] = [];
        const sortedContacts = [...contacts];
        sortedContacts.forEach((contact) => {
          const firstLetter = contact.name.charAt(0).toUpperCase();
          let group = grouped.find((g) => g.letter === firstLetter);
          if (!group) {
            group = { letter: firstLetter, contacts: [] };
            grouped.push(group);
          }
          group.contacts.push(contact);
        });
        return grouped;
      })
    );
  }

  async deleteContact(contactId: string) {
    const contactDocRef = doc(this.firebase, 'contacts', contactId);
    await deleteDoc(contactDocRef);
  }

  async createTask(task: TaskInterface) {
    const newTask = { ...task, status: task.status || 'Todo' };
    return await addDoc(collection(this.firebase, 'tasks'), newTask);
  }

  async updateTask(taskId: string, task: Partial<TaskInterface>) {
    const taskDocRef = doc(this.firebase, 'tasks', taskId);
    return await updateDoc(taskDocRef, task);
  }

  async deleteTask(taskId: string) {
    const taskDocRef = doc(this.firebase, 'tasks', taskId);
    await deleteDoc(taskDocRef);
  }

  async assignTaskToUsers(taskId: string, userIds: string[]) {
    const taskDocRef = doc(this.firebase, 'tasks', taskId);
    await updateDoc(taskDocRef, {
      assignedTo: arrayUnion(...userIds),
    });
  }

  async removeAssignedUserFromTask(taskId: string, userId: string) {
    const taskDocRef = doc(this.firebase, 'tasks', taskId);
    await updateDoc(taskDocRef, {
      assignedTo: arrayRemove(userId),
    });
  }

  getTasksForUser(userId: string) {
    const q = query(
      collection(this.firebase, 'tasks'),
      where('assignedTo', 'array-contains', userId)
    );
    return onSnapshot(q, (snapshot) => {
      const tasks: TaskInterface[] = [];
      snapshot.forEach((doc) => {
        tasks.push(this.setTaskObject(doc.id, doc.data() as TaskInterface));
      });
      return tasks;
    });
  }

  ngOnDestroy() {
    if (this.unsubscribeContacts) {
      this.unsubscribeContacts();
    }
    if (this.unsubscribeTasks) {
      this.unsubscribeTasks();
    }
  }
}
