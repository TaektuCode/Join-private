import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-menuoverlay',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menuoverlay.component.html',
  styleUrl: './menuoverlay.component.scss',
})
export class MenuoverlayComponent {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  private authService = inject(AuthService);

  close(): void {
    this.visible = false;
    this.closed.emit();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.close();
    });
  }
}
