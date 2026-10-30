import { Injectable, computed, signal } from '@angular/core';
import { ALL_PHOTOS, PHOTO_SERIES } from '../data/photos.data';
import { Photo, PhotoSeries } from '../models/photo.model';

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
  private readonly _photos = signal<Photo[]>(shuffleArray(ALL_PHOTOS));
  private readonly _series = signal<PhotoSeries[]>(PHOTO_SERIES);
  
  readonly selectedCategory = signal<string>('all');
  readonly selectedSeries = signal<string | null>(null);
  readonly activePhotoIndex = signal<number>(-1);
  readonly isLightboxOpen = signal<boolean>(false);
  readonly isAboutOpen = signal<boolean>(false);
  readonly favorites = signal<string[]>([]);

  readonly allPhotos = this._photos.asReadonly();
  readonly allSeries = this._series.asReadonly();

  readonly filteredPhotos = computed<Photo[]>(() => {
    let list = this._photos();
    const category = this.selectedCategory();
    const series = this.selectedSeries();

    if (series) {
      list = list.filter(p => p.seriesId === series);
    } else if (category !== 'all') {
      list = list.filter(p => p.category === category);
    }

    return list;
  });

  readonly activePhoto = computed<Photo | null>(() => {
    const index = this.activePhotoIndex();
    const photos = this.filteredPhotos();
    if (index >= 0 && index < photos.length) {
      return photos[index];
    }
    return null;
  });

  constructor() {
    this.loadFavorites();
  }

  shufflePhotos() {
    this._photos.set(shuffleArray(ALL_PHOTOS));
  }

  setCategory(categoryId: string) {
    this.selectedCategory.set(categoryId);
    this.selectedSeries.set(null);
  }

  setSeries(seriesId: string | null) {
    this.selectedSeries.set(seriesId);
    if (seriesId) {
      this.selectedCategory.set('all');
    }
  }

  openLightbox(photo: Photo) {
    const index = this.filteredPhotos().findIndex(p => p.id === photo.id);
    if (index !== -1) {
      this.activePhotoIndex.set(index);
      this.isLightboxOpen.set(true);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    }
  }

  closeLightbox() {
    this.isLightboxOpen.set(false);
    this.activePhotoIndex.set(-1);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  openAbout() {
    this.isAboutOpen.set(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeAbout() {
    this.isAboutOpen.set(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  nextPhoto() {
    const current = this.activePhotoIndex();
    const total = this.filteredPhotos().length;
    if (total === 0) return;
    this.activePhotoIndex.set((current + 1) % total);
  }

  prevPhoto() {
    const current = this.activePhotoIndex();
    const total = this.filteredPhotos().length;
    if (total === 0) return;
    this.activePhotoIndex.set((current - 1 + total) % total);
  }

  selectPhotoByIndex(index: number) {
    const total = this.filteredPhotos().length;
    if (index >= 0 && index < total) {
      this.activePhotoIndex.set(index);
    }
  }

  toggleFavorite(photoId: string) {
    const current = this.favorites();
    let updated: string[];
    if (current.includes(photoId)) {
      updated = current.filter(id => id !== photoId);
    } else {
      updated = [...current, photoId];
    }
    this.favorites.set(updated);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('huutai_favorites', JSON.stringify(updated));
      } catch (e) {
        // ignore storage errors
      }
    }
  }

  isFavorite(photoId: string): boolean {
    return this.favorites().includes(photoId);
  }

  private loadFavorites() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('huutai_favorites');
        if (saved) {
          this.favorites.set(JSON.parse(saved));
        }
      } catch (e) {
        // ignore
      }
    }
  }
}
