import { Injectable, computed, signal } from '@angular/core';

const TOTAL_PHOTOS = 37;
export const PHOTO_PATHS: readonly string[] = Array.from(
  { length: TOTAL_PHOTOS },
  (_, i) => `/images/converted_webp/huutaitran - ${i}.webp`
);

/**
 * Fisher-Yates shuffle algorithm for uniform random distribution
 */
function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

@Injectable({
  providedIn: 'root'
})
export class PhotosService {
  readonly photos = signal<string[]>(shuffleArray(PHOTO_PATHS));
  readonly activePhotoIndex = signal<number>(-1);
  readonly isLightboxOpen = signal<boolean>(false);
  readonly isAboutOpen = signal<boolean>(false);
  readonly isMobileMenuOpen = signal<boolean>(false);

  readonly activePhoto = computed<string | null>(() => {
    const index = this.activePhotoIndex();
    const list = this.photos();
    if (index >= 0 && index < list.length) {
      return list[index];
    }
    return null;
  });

  shufflePhotos() {
    this.photos.set(shuffleArray(PHOTO_PATHS));
  }

  openLightbox(photo: string) {
    const index = this.photos().indexOf(photo);
    if (index !== -1) {
      this.activePhotoIndex.set(index);
      this.isLightboxOpen.set(true);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
      }
    }
  }

  closeLightbox() {
    this.isLightboxOpen.set(false);
    this.activePhotoIndex.set(-1);
    if (typeof document !== 'undefined') {
      if (!this.isAboutOpen() && !this.isMobileMenuOpen()) {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }
    }
  }

  openAbout() {
    this.isAboutOpen.set(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }
  }

  closeAbout() {
    this.isAboutOpen.set(false);
    if (typeof document !== 'undefined') {
      if (!this.isLightboxOpen() && !this.isMobileMenuOpen()) {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }
    }
  }

  nextPhoto() {
    const current = this.activePhotoIndex();
    const total = this.photos().length;
    if (total === 0) return;
    this.activePhotoIndex.set((current + 1) % total);
  }

  prevPhoto() {
    const current = this.activePhotoIndex();
    const total = this.photos().length;
    if (total === 0) return;
    this.activePhotoIndex.set((current - 1 + total) % total);
  }

  selectPhotoByIndex(index: number) {
    const total = this.photos().length;
    if (index >= 0 && index < total) {
      this.activePhotoIndex.set(index);
    }
  }
}
