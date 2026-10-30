import { Injectable, computed, signal } from '@angular/core';
import { ALL_PHOTOS, PHOTO_SERIES } from '../data/photos.data';
import { FilterOption, Photo, PhotoSeries } from '../models/photo.model';

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
  readonly displayMode = signal<'masonry' | 'editorial' | 'grid'>('masonry');
  readonly activePhotoIndex = signal<number>(-1);
  readonly isLightboxOpen = signal<boolean>(false);
  readonly isAboutOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly favorites = signal<string[]>([]);
  readonly visibleCount = signal<number>(24);

  readonly allPhotos = this._photos.asReadonly();
  readonly allSeries = this._series.asReadonly();

  readonly filterOptions = computed<FilterOption[]>(() => {
    const photos = this._photos();
    return [
      { id: 'all', label: 'Toutes les œuvres', count: photos.length },
      { id: 'nights', label: 'Tokyo After Dark', count: photos.filter(p => p.category === 'nights').length },
      { id: 'street', label: 'Street & Scènes', count: photos.filter(p => p.category === 'street').length },
      { id: 'architecture', label: 'Architecture & Lignes', count: photos.filter(p => p.category === 'architecture').length },
      { id: 'atmosphere', label: 'Poésie & Atmosphère', count: photos.filter(p => p.category === 'atmosphere').length }
    ];
  });

  readonly filteredPhotos = computed<Photo[]>(() => {
    let list = this._photos();
    const category = this.selectedCategory();
    const series = this.selectedSeries();
    const query = this.searchQuery().trim().toLowerCase();

    if (series) {
      list = list.filter(p => p.seriesId === series);
    } else if (category !== 'all') {
      list = list.filter(p => p.category === category);
    }

    if (query) {
      list = list.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        (p.district && p.district.toLowerCase().includes(query)) ||
        p.seriesTitle.toLowerCase().includes(query) ||
        p.categoryLabel.toLowerCase().includes(query)
      );
    }

    return list;
  });

  readonly displayedPhotos = computed<Photo[]>(() => {
    const filtered = this.filteredPhotos();
    return filtered.slice(0, this.visibleCount());
  });

  readonly hasMorePhotos = computed<boolean>(() => {
    return this.visibleCount() < this.filteredPhotos().length;
  });

  readonly activePhoto = computed<Photo | null>(() => {
    const index = this.activePhotoIndex();
    const photos = this.filteredPhotos();
    if (index >= 0 && index < photos.length) {
      return photos[index];
    }
    return null;
  });

  readonly featuredPhotos = computed<Photo[]>(() => {
    return this._photos().filter(p => p.featured).slice(0, 8);
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
    this.visibleCount.set(24);
  }

  setSeries(seriesId: string | null) {
    this.selectedSeries.set(seriesId);
    if (seriesId) {
      this.selectedCategory.set('all');
    }
    this.visibleCount.set(24);
  }

  setDisplayMode(mode: 'masonry' | 'editorial' | 'grid') {
    this.displayMode.set(mode);
  }

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
    this.visibleCount.set(24);
  }

  loadMore() {
    this.visibleCount.update(count => count + 24);
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
