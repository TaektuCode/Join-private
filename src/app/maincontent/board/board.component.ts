import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList, } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  todo: string[] = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];
  inProgress: string[] = ['Work on project', 'Meet client'];
  awaitFeedback: string[] = ['Send draft', 'Review comments'];
  done: string[] = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  // Optional: Eine TrackBy-Funktion zur Optimierung der ngFor-Schleife
  // trackByFn(index: number, item: string): number {
  //   return index;
  // }
}