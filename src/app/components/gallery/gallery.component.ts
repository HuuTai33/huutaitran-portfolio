import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
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
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent implements AfterViewInit, OnDestroy {
  readonly photosService = inject(PhotosService);
  readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;
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
  private isAnimating = false;
  private lastFrameTime = 0;

  private touchStartY = 0;
  private touchLastY = 0;
  private touchHistory: { y: number; time: number }[] = [];
  private isPointerDown = false;
  private pointerStartY = 0;
  private pointerLastY = 0;
  private pointerHistory: { y: number; time: number }[] = [];

  // Cached layout dimensions to prevent layout thrashing inside animation loop
  private cachedLeftHeight = 0;
  private cachedRightHeight = 0;
  private resizeObserver?: ResizeObserver;

  private boundWheelListener?: (e: WheelEvent) => void;
  private boundResetListener?: () => void;
  private boundResizeListener?: () => void;
  private boundMouseMoveListener?: (e: MouseEvent) => void;
  private boundMouseUpListener?: () => void;

  // Distribute photos into Left Column (odd photos) and Right Column (even photos)
  readonly leftColumnPhotos = computed<string[]>(() => {
    const photos = this.photosService.photos();
    return photos.filter((_, i) => i % 2 === 1);
  });

  readonly rightColumnPhotos = computed<string[]>(() => {
    const photos = this.photosService.photos();
    return photos.filter((_, i) => i % 2 === 0);
  });

  readonly trackByPhoto = (_index: number, photo: string): string => photo;

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    this.measureSetHeights();
    this.setupEventListeners();
    this.setupResizeObserver();
    this.scheduleAnimation();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (typeof window !== 'undefined') {
      if (this.boundWheelListener) {
        window.removeEventListener('wheel', this.boundWheelListener);
      }
      if (this.boundResetListener) {
        window.removeEventListener('reset-gallery-scroll', this.boundResetListener);
      }
      if (this.boundResizeListener) {
        window.removeEventListener('resize', this.boundResizeListener);
      }
      if (this.boundMouseMoveListener) {
        window.removeEventListener('mousemove', this.boundMouseMoveListener);
      }
      if (this.boundMouseUpListener) {
        window.removeEventListener('mouseup', this.boundMouseUpListener);
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.isBrowser || this.photosService.isMobileMenuOpen() || this.photosService.isLightboxOpen() || this.photosService.isAboutOpen()) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
      e.preventDefault();
      this.targetScroll += 320;
      this.scheduleAnimation();
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
      e.preventDefault();
      this.targetScroll -= 320;
      this.scheduleAnimation();
    } else if (e.key === 'Home') {
      e.preventDefault();
      this.targetScroll = 0;
      this.scheduleAnimation();
    }
  }

  // Pointer / Drag support
  onPointerDown(e: MouseEvent) {
    if (this.photosService.isMobileMenuOpen()) return;
    if (e.button !== 0) return; // Left click only
    this.isPointerDown = true;
    this.pointerStartY = e.clientY;
    this.pointerLastY = e.clientY;
    this.pointerHistory = [{ y: e.clientY, time: (typeof performance !== 'undefined' ? performance.now() : Date.now()) }];
    this.isDragging.set(false);
  }

  onPointerMove(e: MouseEvent) {
    if (this.photosService.isMobileMenuOpen()) return;
    if (!this.isPointerDown) return;
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (!this.isDragging() && Math.abs(e.clientY - this.pointerStartY) > 6) {
      this.isDragging.set(true);
    }
    if (this.isDragging()) {
      const deltaY = this.pointerLastY - e.clientY;
      this.pointerLastY = e.clientY;
      this.pointerHistory.push({ y: e.clientY, time: now });
      this.pointerHistory = this.pointerHistory.filter(s => now - s.time <= 120);
      this.targetScroll += deltaY * 1.35;
      this.scheduleAnimation();
    }
  }

  onPointerUp() {
    if (this.photosService.isMobileMenuOpen()) {
      this.isPointerDown = false;
      this.pointerHistory = [];
      this.isDragging.set(false);
      return;
    }
    if (this.isPointerDown) {
      this.isPointerDown = false;
      if (this.isDragging()) {
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const recent = this.pointerHistory.filter(s => now - s.time <= 120);
        if (recent.length >= 2) {
          const first = recent[0];
          const last = recent[recent.length - 1];
          const dt = last.time - first.time;
          const dy = first.y - last.y;
          if (dt > 10) {
            const velocity = (dy / dt) * 16.67;
            if (Math.abs(velocity) > 1.2) {
              const momentum = Math.max(-2500, Math.min(2500, velocity * 22));
              this.targetScroll += momentum;
              this.scheduleAnimation();
            }
          }
        }
        setTimeout(() => this.isDragging.set(false), 50);
      }
      this.pointerHistory = [];
    }
  }

  // Touch Support
  onTouchStart(e: TouchEvent) {
    if (this.photosService.isMobileMenuOpen()) return;
    if (e.touches.length > 0) {
      this.touchStartY = e.touches[0].clientY;
      this.touchLastY = this.touchStartY;
      this.touchHistory = [{ y: this.touchStartY, time: (typeof performance !== 'undefined' ? performance.now() : Date.now()) }];
      this.isDragging.set(false);
    }
  }

  onTouchMove(e: TouchEvent) {
    if (this.photosService.isMobileMenuOpen()) return;
    if (e.touches.length > 0) {
      const currentY = e.touches[0].clientY;
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const deltaY = this.touchLastY - currentY;
      if (!this.isDragging() && Math.abs(currentY - this.touchStartY) > 6) {
        this.isDragging.set(true);
      }
      if (this.isDragging()) {
        this.touchLastY = currentY;
        this.touchHistory.push({ y: currentY, time: now });
        this.touchHistory = this.touchHistory.filter(s => now - s.time <= 120);
        this.targetScroll += deltaY * 1.35;
        this.scheduleAnimation();
      }
    }
  }

  onTouchEnd() {
    if (this.photosService.isMobileMenuOpen()) {
      this.touchHistory = [];
      this.isDragging.set(false);
      return;
    }
    if (this.isDragging()) {
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const recent = this.touchHistory.filter(s => now - s.time <= 120);
      if (recent.length >= 2) {
        const first = recent[0];
        const last = recent[recent.length - 1];
        const dt = last.time - first.time;
        const dy = first.y - last.y;
        if (dt > 10) {
          const velocity = (dy / dt) * 16.67;
          if (Math.abs(velocity) > 1.2) {
            const momentum = Math.max(-2500, Math.min(2500, velocity * 22));
            this.targetScroll += momentum;
            this.scheduleAnimation();
          }
        }
      }
      setTimeout(() => this.isDragging.set(false), 50);
    }
    this.touchHistory = [];
  }

  onImageLoaded() {
    this.measureSetHeights();
  }

  private measureSetHeights() {
    const leftEl = this.colLeftRef?.nativeElement;
    const rightEl = this.colRightRef?.nativeElement;
    const leftSetEl = this.colLeftSetRef?.nativeElement;
    const rightSetEl = this.colRightSetRef?.nativeElement;

    if (leftSetEl?.offsetHeight) {
      this.cachedLeftHeight = leftSetEl.offsetHeight;
    } else if (leftEl?.scrollHeight) {
      this.cachedLeftHeight = leftEl.scrollHeight / 2;
    }

    if (rightSetEl?.offsetHeight) {
      this.cachedRightHeight = rightSetEl.offsetHeight;
    } else if (rightEl?.scrollHeight) {
      this.cachedRightHeight = rightEl.scrollHeight / 2;
    }
  }

  private setupResizeObserver() {
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(() => {
      this.measureSetHeights();
    });

    if (this.colLeftSetRef?.nativeElement) {
      this.resizeObserver.observe(this.colLeftSetRef.nativeElement);
    }
    if (this.colRightSetRef?.nativeElement) {
      this.resizeObserver.observe(this.colRightSetRef.nativeElement);
    }
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    this.zone.runOutsideAngular(() => {
      this.boundWheelListener = (e: WheelEvent) => {
        if (this.photosService.isMobileMenuOpen()) return;
        if (this.photosService.isLightboxOpen() || this.photosService.isAboutOpen()) return;

        e.preventDefault();
        const delta = e.deltaY;
        const isTrackpad = Math.abs(delta) < 50 && !Number.isInteger(delta);
        const normalizedDelta = Math.abs(delta) > 80
          ? Math.sign(delta) * 130
          : isTrackpad
            ? delta * 1.15
            : delta * 1.25;
        this.targetScroll += normalizedDelta;
        this.scheduleAnimation();
      };

      window.addEventListener('wheel', this.boundWheelListener, { passive: false });

      this.boundResetListener = () => {
        this.targetScroll = 0;
        this.currentScroll = 0;
        this.scheduleAnimation();
      };
      window.addEventListener('reset-gallery-scroll', this.boundResetListener);

      this.boundResizeListener = () => {
        this.measureSetHeights();
      };
      window.addEventListener('resize', this.boundResizeListener, { passive: true });

      this.boundMouseMoveListener = (e: MouseEvent) => {
        if (this.isPointerDown) {
          this.onPointerMove(e);
        }
      };
      window.addEventListener('mousemove', this.boundMouseMoveListener, { passive: true });

      this.boundMouseUpListener = () => {
        if (this.isPointerDown) {
          this.onPointerUp();
        }
      };
      window.addEventListener('mouseup', this.boundMouseUpListener, { passive: true });
    });
  }

  private scheduleAnimation() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    this.zone.runOutsideAngular(() => {
      this.animationFrameId = requestAnimationFrame(this.animationLoop);
    });
  }

  private readonly animationLoop = (time: number) => {
    if (this.photosService.isMobileMenuOpen()) {
      // Discard pending inertia without changing the visible position.
      this.targetScroll = this.currentScroll;
      this.isPointerDown = false;
      this.pointerHistory = [];
      this.touchHistory = [];
      this.isDragging.set(false);
      this.isAnimating = false;
      this.animationFrameId = null;
      this.lastFrameTime = 0;
      return;
    }
    if (!this.lastFrameTime) {
      this.lastFrameTime = time;
    }
    const dt = Math.min((time - this.lastFrameTime) / 16.67, 3);
    this.lastFrameTime = time;

    const diff = this.targetScroll - this.currentScroll;
    if (Math.abs(diff) > 0.08) {
      const lerpRate = 0.095;
      const factor = 1 - Math.pow(1 - lerpRate, dt);
      this.currentScroll += diff * factor;
      this.updateTransforms();
      this.animationFrameId = requestAnimationFrame(this.animationLoop);
    } else {
      this.currentScroll = this.targetScroll;
      this.updateTransforms();
      this.isAnimating = false;
      this.animationFrameId = null;
      this.lastFrameTime = 0;
    }
  };

  private updateTransforms() {
    const leftEl = this.colLeftRef?.nativeElement;
    const rightEl = this.colRightRef?.nativeElement;

    if (!leftEl || !rightEl) return;

    const leftSetHeight = this.cachedLeftHeight || 4000;
    const rightSetHeight = this.cachedRightHeight || 4000;

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
