import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { PhotosService } from '../../services/photos.service';

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.scss'
})
export class LightboxComponent {
  readonly photosService = inject(PhotosService);

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.photosService.isLightboxOpen()) return;

    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowRight') {
      this.next();
    } else if (event.key === 'ArrowLeft') {
      this.prev();
    }
  }

  close() {
    this.photosService.closeLightbox();
  }

  next() {
    this.photosService.nextPhoto();
  }

  prev() {
    this.photosService.prevPhoto();
  }
}
