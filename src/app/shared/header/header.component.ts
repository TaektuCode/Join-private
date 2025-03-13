import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuoverlayComponent } from '../../menuoverlay/menuoverlay.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, MenuoverlayComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'] 
})
export class HeaderComponent {
  overlayVisible = false;

  toggleOverlay(event: MouseEvent): void {
    event.stopPropagation();
    console.log('Kreis geklickt. Alter Overlay-Status', this.overlayVisible);
    this.overlayVisible = !this.overlayVisible;
    console.log('neuer status:', this.overlayVisible);
  }
}

