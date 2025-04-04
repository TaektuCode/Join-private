import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuoverlayComponent } from '../../menuoverlay/menuoverlay.component';
import { AuthService } from '../../login/auth.service';
// achtung wild 

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, MenuoverlayComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  overlayVisible = false;
  userInitials = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser(); // Beispielhafter Aufruf
    if (user && user.name) {
      this.userInitials = this.getUserInitials(user.name);
    }
  }

  getUserInitials(fullName: string): string {
    const [first, second] = fullName.trim().split(' ');
    let initials = first.charAt(0);
    if (second) {
      initials += second.charAt(0);
    }
    return initials.toUpperCase();
  }

  toggleOverlay(event: MouseEvent): void {
    event.stopPropagation();
    this.overlayVisible = !this.overlayVisible;
  }
}



