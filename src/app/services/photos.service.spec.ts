import { TestBed } from '@angular/core/testing';
import { PhotosService, PHOTO_PATHS } from './photos.service';

describe('PhotosService', () => {
  let service: PhotosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotosService);
  });

  it('should be created and load photos collection', () => {
    expect(service).toBeTruthy();
    expect(service.photos().length).toBe(PHOTO_PATHS.length);
  });

  it('should manage lightbox state', () => {
    const photo = service.photos()[0];
    service.openLightbox(photo);
    expect(service.isLightboxOpen()).toBe(true);
    expect(service.activePhoto()).toBe(photo);

    service.nextPhoto();
    expect(service.activePhotoIndex()).toBe(1);

    service.prevPhoto();
    expect(service.activePhotoIndex()).toBe(0);

    service.closeLightbox();
    expect(service.isLightboxOpen()).toBe(false);
  });

  it('should support selectPhotoByIndex and reshuffling photos', () => {
    service.selectPhotoByIndex(3);
    expect(service.activePhotoIndex()).toBe(3);

    const initialList = [...service.photos()];
    service.shufflePhotos();
    const shuffledList = service.photos();
    expect(shuffledList.length).toBe(initialList.length);
  });

  it('should manage about modal state', () => {
    expect(service.isAboutOpen()).toBe(false);
    service.openAbout();
    expect(service.isAboutOpen()).toBe(true);
    service.closeAbout();
    expect(service.isAboutOpen()).toBe(false);
  });
});
