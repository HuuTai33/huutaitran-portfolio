import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GalleryComponent } from './gallery.component';
import { PhotosService } from '../../services/photos.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('GalleryComponent', () => {
  let component: GalleryComponent;
  let fixture: ComponentFixture<GalleryComponent>;
  let photosService: PhotosService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryComponent],
      providers: [PhotosService]
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryComponent);
    component = fixture.componentInstance;
    photosService = TestBed.inject(PhotosService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should freeze the background and discard inertia while the mobile menu is open', () => {
    fixture.destroy();
    const frames: FrameRequestCallback[] = [];
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      frames.push(callback);
      return frames.length;
    });
    try {
      fixture = TestBed.createComponent(GalleryComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      const column = component.colLeftRef!.nativeElement;
      frames.shift()!(16);
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
      frames.shift()!(32);
      const position = column.style.transform;

      photosService.isMobileMenuOpen.set(true);
      frames.shift()!(48);
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
      component.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      const touch = new TouchEvent('touchmove');
      Object.defineProperty(touch, 'touches', { value: [{ clientY: 200 }] });
      component.onTouchStart(touch);
      component.onTouchMove(touch);
      component.onTouchEnd();
      component.onPointerDown(new MouseEvent('mousedown', { clientY: 200 }));
      component.onPointerMove(new MouseEvent('mousemove', { clientY: 100 }));
      component.onPointerUp();
      expect(column.style.transform).toBe(position);
      expect(frames).toHaveLength(0);
      expect(component.isDragging()).toBe(false);

      photosService.isMobileMenuOpen.set(false);
      expect(frames).toHaveLength(0);
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
      frames.shift()!(64);
      frames.shift()!(80);
      expect(column.style.transform).not.toBe(position);
    } finally {
      raf.mockRestore();
    }
  });

  it('should open lightbox when clicking on a photo item', () => {
    const photo = photosService.photos()[0];
    const openLightboxSpy = vi.spyOn(photosService, 'openLightbox');

    component.openPhoto(photo);

    expect(openLightboxSpy).toHaveBeenCalledWith(photo);
    expect(photosService.isLightboxOpen()).toBe(true);
    expect(photosService.activePhoto()).toBe(photo);
  });

  it('should not open lightbox when user is dragging', () => {
    const photo = photosService.photos()[0];
    const openLightboxSpy = vi.spyOn(photosService, 'openLightbox');

    component.isDragging.set(true);
    component.openPhoto(photo);

    expect(openLightboxSpy).not.toHaveBeenCalled();
  });

  it('should trigger lightbox from template photo click', () => {
    const photoItem = fixture.nativeElement.querySelector('.photo-item') as HTMLElement;
    expect(photoItem).toBeTruthy();

    photoItem.click();
    fixture.detectChanges();

    expect(photosService.isLightboxOpen()).toBe(true);
  });

  it('should handle touch drag and release without opening lightbox', () => {
    const touchStartEvent = {
      touches: [{ clientY: 300 }]
    } as unknown as TouchEvent;
    component.onTouchStart(touchStartEvent);

    const touchMoveEvent = {
      touches: [{ clientY: 200 }]
    } as unknown as TouchEvent;
    component.onTouchMove(touchMoveEvent);

    expect(component.isDragging()).toBe(true);

    const openLightboxSpy = vi.spyOn(photosService, 'openLightbox');
    component.openPhoto(photosService.photos()[0]);
    expect(openLightboxSpy).not.toHaveBeenCalled();

    component.onTouchEnd();
  });
});
