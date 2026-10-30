import { TestBed } from '@angular/core/testing';
import { PhotosService } from './photos.service';

describe('PhotosService', () => {
  let service: PhotosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotosService);
  });

  it('should be created and load photos collection', () => {
    expect(service).toBeTruthy();
    expect(service.allPhotos().length).toBeGreaterThan(0);
    expect(service.allSeries().length).toBe(4);
  });

  it('should filter photos by category', () => {
    service.setCategory('nights');
    expect(service.filteredPhotos().every(p => p.category === 'nights')).toBe(true);
  });

  it('should filter photos by series', () => {
    service.setSeries('tokyo-nights');
    expect(service.filteredPhotos().every(p => p.seriesId === 'tokyo-nights')).toBe(true);
  });

  it('should manage lightbox state', () => {
    const photo = service.allPhotos()[0];
    service.openLightbox(photo);
    expect(service.isLightboxOpen()).toBe(true);
    expect(service.activePhoto()?.id).toBe(photo.id);

    service.nextPhoto();
    expect(service.activePhotoIndex()).toBe(1);

    service.closeLightbox();
    expect(service.isLightboxOpen()).toBe(false);
  });

  it('should toggle favorites', () => {
    const photoId = 'tokyo-1';
    expect(service.isFavorite(photoId)).toBe(false);
    service.toggleFavorite(photoId);
    expect(service.isFavorite(photoId)).toBe(true);
    service.toggleFavorite(photoId);
    expect(service.isFavorite(photoId)).toBe(false);
  });

  it('should support reshuffling photos', () => {
    const initialList = [...service.allPhotos()];
    service.shufflePhotos();
    const shuffledList = service.allPhotos();
    expect(shuffledList.length).toBe(initialList.length);
  });
});
