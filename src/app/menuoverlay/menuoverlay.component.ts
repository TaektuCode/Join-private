import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../login/auth.service';

/**
 * Component for displaying an overlay menu, typically used for navigation and logout options.
 */
@Component({
  selector: 'app-menuoverlay',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menuoverlay.component.html',
  styleUrl: './menuoverlay.component.scss',
})
export class MenuoverlayComponent {
  /**
   * Controls the visibility of the menu overlay.
   */
  @Input() visible = false;
  /**
   * Emits an event when the menu overlay is closed.
   */
  @Output() closed = new EventEmitter<void>();

  private authService = inject(AuthService);

  /**
   * Closes the menu overlay and emits the 'closed' event.
   */
  close(): void {
    this.visible = false;
    this.closed.emit();
  }

  /**
   * Logs out the current user using the AuthService and then closes the menu overlay.
   */
  logout(): void {
    this.authService.logout().subscribe(() => {
      this.close();
    });
  }
}