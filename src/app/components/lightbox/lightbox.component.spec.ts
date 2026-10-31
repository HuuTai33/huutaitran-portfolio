import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LightboxComponent } from './lightbox.component';
import { PhotosService } from '../../services/photos.service';
import { Photo } from '../../models/photo.model';

describe('LightboxComponent', () => {
  let component: LightboxComponent;
  let fixture: ComponentFixture<LightboxComponent>;
  let photosService: PhotosService;

  const mockPhoto: Photo = {
    id: 'test-photo-1',
    src: '/images/photo_1.jpg',
    filename: 'photo_1.jpg',
    title: 'Test Tokyo Street',
    seriesId: 'street-chronicles',
    seriesTitle: 'Street Chronicles',
    category: 'street',
    categoryLabel: 'Street Photography',
    location: 'Shinjuku, Tokyo',
    district: 'Shinjuku',
    year: 2024,
    aspectRatio: 'horizontal'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightboxComponent],
      providers: [PhotosService]
    }).compileComponents();

    fixture = TestBed.createComponent(LightboxComponent);
    component = fixture.componentInstance;
    photosService = TestBed.inject(PhotosService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display lightbox when closed', () => {
    const backdrop = fixture.nativeElement.querySelector('.lightbox-backdrop');
    expect(backdrop).toBeNull();
  });

  it('should display centered photo and blurred backdrop when open', () => {
    const photo = photosService.allPhotos()[0];
    photosService.openLightbox(photo);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.lightbox-backdrop');
    const img = fixture.nativeElement.querySelector('.lightbox-photo-img') as HTMLImageElement;
    const closeBtn = fixture.nativeElement.querySelector('.lightbox-close-btn');

    expect(backdrop).toBeTruthy();
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe(photo.src);
    expect(closeBtn).toBeTruthy();
  });

  it('should close lightbox when clicking close button or backdrop', () => {
    const photo = photosService.allPhotos()[0];
    photosService.openLightbox(photo);
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.lightbox-close-btn') as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(photosService.isLightboxOpen()).toBe(false);
  });
});
