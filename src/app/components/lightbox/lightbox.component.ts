import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { Photo } from '../../models/photo.model';
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

  readonly isZoomed = signal<boolean>(false);
  readonly showDetails = signal<boolean>(true);
  readonly copiedNotification = signal<boolean>(false);

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.photosService.isLightboxOpen()) return;

    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowRight') {
      this.next();
    } else if (event.key === 'ArrowLeft') {
      this.prev();
    } else if (event.key === 'f' || event.key === 'F') {
      this.toggleFullscreen();
    }
  }

  close() {
    this.isZoomed.set(false);
    this.photosService.closeLightbox();
  }

  next() {
    this.isZoomed.set(false);
    this.photosService.nextPhoto();
  }

  prev() {
    this.isZoomed.set(false);
    this.photosService.prevPhoto();
  }

  selectThumb(index: number) {
    this.isZoomed.set(false);
    this.photosService.selectPhotoByIndex(index);
  }

  toggleZoom() {
    this.isZoomed.update(z => !z);
  }

  toggleDetails() {
    this.showDetails.update(d => !d);
  }

  toggleFullscreen() {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  toggleFavorite(photo: Photo) {
    this.photosService.toggleFavorite(photo.id);
  }

  copyLink(photo: Photo) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const url = `${window.location.origin}${photo.src}`;
      navigator.clipboard.writeText(url).then(() => {
        this.copiedNotification.set(true);
        setTimeout(() => this.copiedNotification.set(false), 2500);
      });
    }
  }
}
