import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { PhotosService } from '../../services/photos.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  readonly photosService = inject(PhotosService);

  @HostListener('window:keydown.escape')
  onEscape() {
    if (this.photosService.isAboutOpen()) {
      this.close();
    }
  }

  close() {
    this.photosService.closeAbout();
  }
}
