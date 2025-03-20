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

@Injectable({
  providedIn: 'root',
})
export class FirebaseService implements OnDestroy {
  firebase = inject(Firestore); // Inject Firestore service
  unsubscribeTasks: Unsubscribe | undefined; // Variable to store unsubscribe function for contacts
  unsubscribeContacts: Unsubscribe | undefined; // Variable to store unsubscribe function for tasks
  contactList: ContactInterface[] = []; // Array to hold contact list
  taskList: TaskInterface[] = []; // Array to hold task list

  constructor() {
    this.subscribeToContacts(); // Subscribe to contact updates
    this.subscribeToTasks(); // Subscribe to task updates
  }

  private subscribeToContacts() {
    // Subscribe to real-time updates from the 'contacts' collection
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
        this.contactList = sortedContacts;
      }
    );
  }

  private subscribeToTasks() {
    // Subscribe to real-time updates from the 'tasks' collection
    this.unsubscribeTasks = onSnapshot(
      collection(this.firebase, 'tasks'),
      (tasksObject) => {
        const sortedTasks: TaskInterface[] = [];
        tasksObject.forEach((element) => {
          sortedTasks.push(
            this.setTaskObject(element.id, element.data() as TaskInterface)
          );
        });
        this.taskList = sortedTasks;
      }
    );
  }

  setContactObject(id: string, obj: ContactInterface): ContactInterface {
    // Method to create a ContactInterface object from document data
    return {
      id: id,
      email: obj.email,
      name: obj.name,
      phone: obj.phone,
      color: obj.color,
    };
  }

  setTaskObject(id: string, obj: TaskInterface): TaskInterface {
    // Method to create a TaskInterface object from document data
    return {
      id: id,
      title: obj.title,
      date: obj.date, // Convert Firebase Timestamp to Date object
      category: obj.category,
      description: obj.description,
      assignedTo: obj.assignedTo || [],
      created: obj.created ? obj.created : undefined, // Convert Firebase Timestamp to Date object
      edited: obj.edited ? obj.edited : undefined, // Convert Firebase Timestamp to Date object
      priority: obj.priority,
      subtask: obj.subtask || [],
    };
  }

  getGroupedContacts(): { letter: string; contacts: ContactInterface[] }[] {
    // Method to group contacts by the first letter of their name
    const grouped: { letter: string; contacts: ContactInterface[] }[] = [];
    const sortedContacts = [...this.contactList];
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
  }

  async deleteContact(contactId: string) {
    // Method to delete a contact
    const contactDocRef = doc(this.firebase, 'contacts', contactId);
    await deleteDoc(contactDocRef);
  }

  async createTask(task: TaskInterface) {
    // Method to create a new task
    return await addDoc(collection(this.firebase, 'tasks'), task);
  }

  async updateTask(taskId: string, task: TaskInterface) {
    // Method to update an existing task
    const taskDocRef = doc(this.firebase, 'tasks', taskId);
    const taskData = {
      title: task.title,
      date: task.date,
      category: task.category,
      description: task.description,
      assignedTo: task.assignedTo,
      created: task.created,
      edited: task.edited,
      priority: task.priority,
      subtask: task.subtask,
    };
    return await updateDoc(taskDocRef, taskData);
  }

  async deleteTask(taskId: string) {
    // Method to delete a task
    const taskDocRef = doc(this.firebase, 'tasks', taskId);
    await deleteDoc(taskDocRef);
  }

  async assignTaskToUsers(taskId: string, userIds: string[]) {
    // Method to assign a task to multiple users
    const taskDocRef = doc(this.firebase, 'tasks', taskId);
    await updateDoc(taskDocRef, {
      assignedTo: arrayUnion(...userIds),
    });
  }

  async removeAssignedUserFromTask(taskId: string, userId: string) {
    // Method to remove an assigned user from a task
    const taskDocRef = doc(this.firebase, 'tasks', taskId);
    await updateDoc(taskDocRef, {
      assignedTo: arrayRemove(userId),
    });
  }

  getTasksForUser(userId: string) {
    // Method to get tasks assigned to a specific user
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
    // Lifecycle hook to unsubscribe from onSnapshot when the service is destroyed
    if (this.unsubscribeContacts) {
      this.unsubscribeContacts();
    }
    if (this.unsubscribeTasks) {
      this.unsubscribeTasks();
    }
  }
}
