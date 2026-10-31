import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { PhotosService } from '../../services/photos.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements AfterViewInit, OnDestroy {
  readonly photosService = inject(PhotosService);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('colLeft') colLeftRef?: ElementRef<HTMLElement>;
  @ViewChild('colLeftSet') colLeftSetRef?: ElementRef<HTMLElement>;
  @ViewChild('colRight') colRightRef?: ElementRef<HTMLElement>;
  @ViewChild('colRightSet') colRightSetRef?: ElementRef<HTMLElement>;

  readonly isDragging = signal<boolean>(false);

  // Parallax multipliers for left and right columns
  readonly speedLeft = 0.92;
  readonly speedRight = 1.08;

  // Infinite Animation & Physics state
  private targetScroll = 0;
  private currentScroll = 0;
  private animationFrameId: number | null = null;
  private touchStartY = 0;
  private touchLastY = 0;
  private isPointerDown = false;
  private pointerStartY = 0;
  private pointerLastY = 0;

  private boundWheelListener?: (e: WheelEvent) => void;
  private boundResetListener?: () => void;

  // Distribute photos into Left Column (odd photos) and Right Column (even photos)
  readonly leftColumnPhotos = computed<string[]>(() => {
    const photos = this.photosService.photos();
    return photos.filter((_, i) => i % 2 === 1);
  });

  readonly rightColumnPhotos = computed<string[]>(() => {
    const photos = this.photosService.photos();
    return photos.filter((_, i) => i % 2 === 0);
  });

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    this.setupEventListeners();
    this.startAnimationLoop();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (typeof window !== 'undefined' && this.boundWheelListener) {
      window.removeEventListener('wheel', this.boundWheelListener);
    }
    if (typeof window !== 'undefined' && this.boundResetListener) {
      window.removeEventListener('reset-gallery-scroll', this.boundResetListener);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.isBrowser || this.photosService.isLightboxOpen() || this.photosService.isAboutOpen()) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
      e.preventDefault();
      this.targetScroll += 320;
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
      e.preventDefault();
      this.targetScroll -= 320;
    } else if (e.key === 'Home') {
      e.preventDefault();
      this.targetScroll = 0;
    }
  }

  // Pointer / Drag support
  onPointerDown(e: MouseEvent) {
    if (e.button !== 0) return; // Left click only
    this.isPointerDown = true;
    this.pointerStartY = e.clientY;
    this.pointerLastY = e.clientY;
    this.isDragging.set(false);
  }

  @HostListener('window:mousemove', ['$event'])
  onPointerMove(e: MouseEvent) {
    if (!this.isPointerDown) return;
    if (!this.isDragging() && Math.abs(e.clientY - this.pointerStartY) > 6) {
      this.isDragging.set(true);
    }
    if (this.isDragging()) {
      const deltaY = this.pointerLastY - e.clientY;
      this.pointerLastY = e.clientY;
      this.targetScroll += deltaY * 1.5;
    }
  }

  @HostListener('window:mouseup')
  onPointerUp() {
    if (this.isPointerDown) {
      this.isPointerDown = false;
      if (this.isDragging()) {
        setTimeout(() => this.isDragging.set(false), 50);
      }
    }
  }

  // Touch Support
  onTouchStart(e: TouchEvent) {
    if (e.touches.length > 0) {
      this.touchStartY = e.touches[0].clientY;
      this.touchLastY = this.touchStartY;
      this.isDragging.set(false);
    }
  }

  onTouchMove(e: TouchEvent) {
    if (e.touches.length > 0) {
      const currentY = e.touches[0].clientY;
      const deltaY = this.touchLastY - currentY;
      if (!this.isDragging() && Math.abs(currentY - this.touchStartY) > 6) {
        this.isDragging.set(true);
      }
      if (this.isDragging()) {
        this.touchLastY = currentY;
        this.targetScroll += deltaY * 1.4;
      }
    }
  }

  onTouchEnd() {
    if (this.isDragging()) {
      setTimeout(() => this.isDragging.set(false), 50);
    }
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    this.zone.runOutsideAngular(() => {
      this.boundWheelListener = (e: WheelEvent) => {
        if (this.photosService.isLightboxOpen() || this.photosService.isAboutOpen()) return;
        
        e.preventDefault();
        // Normalize wheel delta across trackpads & physical mouse wheels
        const delta = e.deltaY;
        const normalizedDelta = Math.abs(delta) > 80 ? Math.sign(delta) * 120 : delta * 1.2;
        this.targetScroll += normalizedDelta;
      };

      window.addEventListener('wheel', this.boundWheelListener, { passive: false });

      this.boundResetListener = () => {
        this.targetScroll = 0;
        this.currentScroll = 0;
      };
      window.addEventListener('reset-gallery-scroll', this.boundResetListener);
    });
  }

  private startAnimationLoop() {
    const loop = () => {
      // Linear interpolation (LERP) physics
      const diff = this.targetScroll - this.currentScroll;
      if (Math.abs(diff) > 0.1) {
        this.currentScroll += diff * 0.085;
        this.updateTransforms();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.zone.runOutsideAngular(() => {
      this.animationFrameId = requestAnimationFrame(loop);
    });
  }

  private updateTransforms() {
    const leftEl = this.colLeftRef?.nativeElement;
    const rightEl = this.colRightRef?.nativeElement;
    const leftSetEl = this.colLeftSetRef?.nativeElement;
    const rightSetEl = this.colRightSetRef?.nativeElement;

    if (!leftEl || !rightEl) return;

    const leftSetHeight = leftSetEl?.offsetHeight || (leftEl.scrollHeight / 2) || 4000;
    const rightSetHeight = rightSetEl?.offsetHeight || (rightEl.scrollHeight / 2) || 4000;

    // Infinite parallax wrap calculation for bidirectional scrolling
    const leftOffset = (((this.currentScroll * this.speedLeft) % leftSetHeight) + leftSetHeight) % leftSetHeight;
    const rightOffset = (((this.currentScroll * this.speedRight) % rightSetHeight) + rightSetHeight) % rightSetHeight;

    leftEl.style.transform = `translate3d(0, ${-leftOffset}px, 0)`;
    rightEl.style.transform = `translate3d(0, ${-rightOffset}px, 0)`;
  }

  openPhoto(photo: string) {
    if (this.isDragging()) return;
    this.photosService.openLightbox(photo);
  }
}
