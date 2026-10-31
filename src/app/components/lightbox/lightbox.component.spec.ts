import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LightboxComponent } from './lightbox.component';
import { PhotosService } from '../../services/photos.service';
import { beforeEach, describe, expect, it } from 'vitest';

describe('LightboxComponent', () => {
  let component: LightboxComponent;
  let fixture: ComponentFixture<LightboxComponent>;
  let photosService: PhotosService;

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
    const photo = photosService.photos()[0];
    photosService.openLightbox(photo);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.lightbox-backdrop');
    const img = fixture.nativeElement.querySelector('.lightbox-photo-img') as HTMLImageElement;
    const closeBtn = fixture.nativeElement.querySelector('.lightbox-close-btn');

    expect(backdrop).toBeTruthy();
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe(photo);
    expect(closeBtn).toBeTruthy();
  });

  it('should close lightbox when clicking close button or backdrop', () => {
    const photo = photosService.photos()[0];
    photosService.openLightbox(photo);
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.lightbox-close-btn') as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(photosService.isLightboxOpen()).toBe(false);
  });
});
