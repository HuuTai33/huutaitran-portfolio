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
  inject,
  signal
} from '@angular/core';
import { LoaderComponent } from '../../components/loader/loader.component';
import { LanguageService } from '../../services/language.service';

export interface WebProject {
  title: string;
  image: string;
  url: string;
}

@Component({
  selector: 'app-web-development',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './web-development.component.html',
  styleUrl: './web-development.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebDevelopmentComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;

  @ViewChild('track') trackRef?: ElementRef<HTMLElement>;
  @ViewChild('set1') set1Ref?: ElementRef<HTMLElement>;

  readonly isDragging = signal<boolean>(false);

  // Infinite physics & scroll state
  private targetScroll = 0;
  private currentScroll = 0;
  private animationFrameId: number | null = null;
  private isAnimating = false;

  private touchStartX = 0;
  private touchLastX = 0;
  private touchLastTime = 0;
  private touchVelocity = 0;
  private isPointerDown = false;
  private pointerStartX = 0;
  private pointerLastX = 0;

  // Cached layout width to prevent layout thrashing
  private cachedSetWidth = 0;
  private resizeObserver?: ResizeObserver;

  private boundWheelListener?: (e: WheelEvent) => void;
  private boundResizeListener?: () => void;
  private boundMouseMoveListener?: (e: MouseEvent) => void;
  private boundMouseUpListener?: () => void;

  readonly projects = signal<readonly WebProject[]>([
    {
      title: 'Marina J Photographie',
      image: '/images/work_dev/converted_webp/marinajphotographie.webp',
      url: 'https://www.marinajphotographie.fr/',
    },
    {
      title: 'Marina J Photographie',
      image: '/images/work_dev/converted_webp/marinajphotographie.webp',
      url: 'https://www.marinajphotographie.fr/',
    },
  ]);

  readonly trackByProject = (_index: number, project: WebProject) => project.title + project.url;

  ngAfterViewInit() {
    if (!this.isBrowser || this.projects().length <= 1) return;

    this.measureSetWidth();
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
    if (!this.isBrowser || this.projects().length <= 1) return;

    if (
      e.key === 'ArrowRight' ||
      e.key === 'ArrowDown' ||
      e.key === 'PageDown' ||
      (e.key === ' ' && !e.shiftKey)
    ) {
      e.preventDefault();
      this.targetScroll += 360;
      this.scheduleAnimation();
    } else if (
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowUp' ||
      e.key === 'PageUp' ||
      (e.key === ' ' && e.shiftKey)
    ) {
      e.preventDefault();
      this.targetScroll -= 360;
      this.scheduleAnimation();
    } else if (e.key === 'Home') {
      e.preventDefault();
      this.targetScroll = 0;
      this.scheduleAnimation();
    }
  }

  // Pointer / Drag support
  onPointerDown(e: MouseEvent) {
    if (this.projects().length <= 1 || e.button !== 0) return;
    this.isPointerDown = true;
    this.pointerStartX = e.clientX;
    this.pointerLastX = e.clientX;
    this.isDragging.set(false);
  }

  onPointerMove(e: MouseEvent) {
    if (!this.isPointerDown || this.projects().length <= 1) return;
    if (!this.isDragging() && Math.abs(e.clientX - this.pointerStartX) > 6) {
      this.isDragging.set(true);
    }
    if (this.isDragging()) {
      const deltaX = this.pointerLastX - e.clientX;
      this.pointerLastX = e.clientX;
      this.targetScroll += deltaX * 1.4;
      this.scheduleAnimation();
    }
  }

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
    if (this.projects().length <= 1 || e.touches.length === 0) return;
    this.touchStartX = e.touches[0].clientX;
    this.touchLastX = this.touchStartX;
    this.touchLastTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    this.touchVelocity = 0;
    this.isDragging.set(false);
  }

  onTouchMove(e: TouchEvent) {
    if (this.projects().length <= 1 || e.touches.length === 0) return;
    const currentX = e.touches[0].clientX;
    const currentTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const deltaX = this.touchLastX - currentX;
    const timeDelta = currentTime - this.touchLastTime;

    if (!this.isDragging() && Math.abs(currentX - this.touchStartX) > 6) {
      this.isDragging.set(true);
    }
    if (this.isDragging()) {
      if (timeDelta > 0) {
        this.touchVelocity = (deltaX / timeDelta) * 16.67;
      }
      this.touchLastX = currentX;
      this.touchLastTime = currentTime;
      this.targetScroll += deltaX * 1.35;
      this.scheduleAnimation();
    }
  }

  onTouchEnd() {
    if (this.isDragging()) {
      if (Math.abs(this.touchVelocity) > 1.5) {
        const momentum = Math.max(-350, Math.min(350, this.touchVelocity * 10));
        this.targetScroll += momentum;
        this.scheduleAnimation();
      }
      setTimeout(() => this.isDragging.set(false), 50);
    }
  }

  onLinkClick(e: MouseEvent) {
    if (this.isDragging()) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  private measureSetWidth() {
    const setEl = this.set1Ref?.nativeElement;
    if (setEl?.offsetWidth) {
      this.cachedSetWidth = setEl.offsetWidth;
    }
  }

  private setupResizeObserver() {
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(() => {
      this.measureSetWidth();
    });

    if (this.set1Ref?.nativeElement) {
      this.resizeObserver.observe(this.set1Ref.nativeElement);
    }
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    this.zone.runOutsideAngular(() => {
      this.boundWheelListener = (e: WheelEvent) => {
        // Intercept wheel on page to scroll horizontally
        e.preventDefault();
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        const normalizedDelta = Math.abs(delta) > 80 ? Math.sign(delta) * 120 : delta * 1.2;
        this.targetScroll += normalizedDelta;
        this.scheduleAnimation();
      };

      window.addEventListener('wheel', this.boundWheelListener, { passive: false });

      this.boundResizeListener = () => {
        this.measureSetWidth();
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

  private readonly animationLoop = () => {
    const diff = this.targetScroll - this.currentScroll;
    if (Math.abs(diff) > 0.05) {
      this.currentScroll += diff * 0.085;
      this.updateTransforms();
      this.animationFrameId = requestAnimationFrame(this.animationLoop);
    } else {
      this.currentScroll = this.targetScroll;
      this.updateTransforms();
      this.isAnimating = false;
      this.animationFrameId = null;
    }
  };

  private updateTransforms() {
    const trackEl = this.trackRef?.nativeElement;

    if (!trackEl || this.projects().length <= 1) return;

    const setWidth = this.cachedSetWidth || 1000;

    // Infinite wrap calculation for bidirectional horizontal scrolling
    const offset = ((this.currentScroll % setWidth) + setWidth) % setWidth;
    trackEl.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }
}
