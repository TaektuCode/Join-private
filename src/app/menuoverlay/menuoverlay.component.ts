import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menuoverlay',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menuoverlay.component.html',
  styleUrl: './menuoverlay.component.scss'
})
export class MenuoverlayComponent {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.visible = false;
    this.closed.emit();
  }

}
