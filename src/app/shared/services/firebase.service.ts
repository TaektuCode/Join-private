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

/**
 * Service for interacting with Firebase Firestore, managing contacts and tasks.
 */
@Injectable({
  providedIn: 'root',
})
export class FirebaseService implements OnDestroy {
  private firebase = inject(Firestore);
  private unsubscribeTasks: Unsubscribe | undefined;
  private unsubscribeContacts: Unsubscribe | undefined;
  private _taskList = new BehaviorSubject<TaskInterface[]>([]); // BehaviorSubject for Tasks
  /**
   * Observable emitting the latest array of tasks.
   */
  taskList$: Observable<TaskInterface[]> = this._taskList.asObservable(); // Observable for Tasks
  private _contactList = new BehaviorSubject<ContactInterface[]>([]);
  /**
   * Observable emitting the latest array of contacts.
   */
  contactList: Observable<ContactInterface[]> =
    this._contactList.asObservable();

  /**
   * Initializes the FirebaseService and subscribes to contacts and tasks collections.
   */
  constructor() {
    this.subscribeToContacts();
    this.subscribeToTasks();
  }

  /**
   * Subscribes to the 'contacts' collection in Firestore and updates the contactList BehaviorSubject.
   */
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

  /**
   * Subscribes to the 'tasks' collection in Firestore and updates the taskList BehaviorSubject.
   */
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
        this._taskList.next(sortedTasks); // Use _taskList.next()
      }
    );
  }

  /**
   * Creates a ContactInterface object with the provided ID and data.
   * @param id The document ID.
   * @param obj The ContactInterface data.
   * @returns A ContactInterface object.
   */
  setContactObject(id: string, obj: ContactInterface): ContactInterface {
    return {
      id: id,
      email: obj.email,
      name: obj.name,
      phone: obj.phone,
      color: obj.color,
    };
  }

  /**
   * Creates a TaskInterface object with the provided ID and data.
   * @param id The document ID.
   * @param obj The TaskInterface data.
   * @returns A TaskInterface object.
   */
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

  /**
   * Retrieves an Observable of contacts grouped by the first letter of their name.
   * @returns An Observable emitting an array of objects, where each object contains a 'letter' and an array of 'contacts'.
   */
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

  /**
   * Deletes a contact from Firestore.
   * @param contactId The ID of the contact to delete.
   */
  async deleteContact(contactId: string) {
    const contactDocRef = doc(this.firebase, 'contacts', contactId);
    await deleteDoc(contactDocRef);
  }

  /**
   * Creates a new task in Firestore.
   * @param task The TaskInterface object to create.
   * @returns A Promise containing the DocumentReference of the newly created task.
   */
  async createTask(task: TaskInterface) {
    const newTask = { ...task, status: task.status || 'Todo' };
    return await addDoc(collection(this.firebase, 'tasks'), newTask);
  }

  /**
   * Updates an existing task in Firestore.
   * @param taskId The ID of the task to update.
   * @param task An object containing the fields to update.
   */
  async updateTask(taskId: string, task: Partial<TaskInterface>) {
    const taskDocRef = doc(this.firebase, 'tasks', taskId);
    return await updateDoc(taskDocRef, task);
  }

  /**
   * Deletes a task from Firestore.
   * @param taskId The ID of the task to delete.
   */
  async deleteTask(taskId: string) {
    const taskDocRef = doc(this.firebase, 'tasks', taskId);
    await deleteDoc(taskDocRef);
  }

  /**
   * Assigns multiple users to a task in Firestore.
   * @param taskId The ID of the task to assign users to.
   * @param userIds An array of user IDs to assign.
   */
  async assignTaskToUsers(taskId: string, userIds: string[]) {
    const taskDocRef = doc(this.firebase, 'tasks', taskId);
    await updateDoc(taskDocRef, {
      assignedTo: arrayUnion(...userIds),
    });
  }

  /**
   * Removes a specific user from the assigned users of a task in Firestore.
   * @param taskId The ID of the task to remove the user from.
   * @param userId The ID of the user to remove.
   */
  async removeAssignedUserFromTask(taskId: string, userId: string) {
    const taskDocRef = doc(this.firebase, 'tasks', taskId);
    await updateDoc(taskDocRef, {
      assignedTo: arrayRemove(userId),
    });
  }

  /**
   * Retrieves an Observable of tasks assigned to a specific user.
   * @param userId The ID of the user to get tasks for.
   * @returns An Observable emitting an array of TaskInterface objects assigned to the user.
   */
  getTasksForUser(userId: string): Observable<TaskInterface[]> {
    const q = query(
      collection(this.firebase, 'tasks'),
      where('assignedTo', 'array-contains', userId)
    );
    return new Observable((subscriber) => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks: TaskInterface[] = [];
        snapshot.forEach((doc) => {
          tasks.push(this.setTaskObject(doc.id, doc.data() as TaskInterface));
        });
        subscriber.next(tasks);
      }, (error) => {
        subscriber.error(error);
      }, () => {
        subscriber.complete();
      });
      return unsubscribe;
    });
  }

  /**
   * Unsubscribes from the Firestore listeners when the service is destroyed.
   */
  ngOnDestroy() {
    if (this.unsubscribeContacts) {
      this.unsubscribeContacts();
    }
    if (this.unsubscribeTasks) {
      this.unsubscribeTasks();
    }
  }
}