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
  inject,
  signal
} from '@angular/core';
import { LoaderComponent } from '../../components/loader/loader.component';

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
})
export class WebDevelopmentComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('track') trackRef?: ElementRef<HTMLElement>;
  @ViewChild('set1') set1Ref?: ElementRef<HTMLElement>;

  readonly isDragging = signal<boolean>(false);

  // Infinite physics & scroll state
  private targetScroll = 0;
  private currentScroll = 0;
  private animationFrameId: number | null = null;
  private touchStartX = 0;
  private touchLastX = 0;
  private isPointerDown = false;
  private pointerStartX = 0;
  private pointerLastX = 0;

  private boundWheelListener?: (e: WheelEvent) => void;

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

  ngAfterViewInit() {
    if (!this.isBrowser || this.projects().length <= 1) return;

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
    } else if (
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowUp' ||
      e.key === 'PageUp' ||
      (e.key === ' ' && e.shiftKey)
    ) {
      e.preventDefault();
      this.targetScroll -= 360;
    } else if (e.key === 'Home') {
      e.preventDefault();
      this.targetScroll = 0;
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

  @HostListener('window:mousemove', ['$event'])
  onPointerMove(e: MouseEvent) {
    if (!this.isPointerDown || this.projects().length <= 1) return;
    if (!this.isDragging() && Math.abs(e.clientX - this.pointerStartX) > 6) {
      this.isDragging.set(true);
    }
    if (this.isDragging()) {
      const deltaX = this.pointerLastX - e.clientX;
      this.pointerLastX = e.clientX;
      this.targetScroll += deltaX * 1.4;
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
    if (this.projects().length <= 1 || e.touches.length === 0) return;
    this.touchStartX = e.touches[0].clientX;
    this.touchLastX = this.touchStartX;
    this.isDragging.set(false);
  }

  onTouchMove(e: TouchEvent) {
    if (this.projects().length <= 1 || e.touches.length === 0) return;
    const currentX = e.touches[0].clientX;
    const deltaX = this.touchLastX - currentX;
    if (!this.isDragging() && Math.abs(currentX - this.touchStartX) > 6) {
      this.isDragging.set(true);
    }
    if (this.isDragging()) {
      this.touchLastX = currentX;
      this.targetScroll += deltaX * 1.4;
    }
  }

  onTouchEnd() {
    if (this.isDragging()) {
      setTimeout(() => this.isDragging.set(false), 50);
    }
  }

  onLinkClick(e: MouseEvent) {
    if (this.isDragging()) {
      e.preventDefault();
      e.stopPropagation();
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
      };

      window.addEventListener('wheel', this.boundWheelListener, { passive: false });
    });
  }

  private startAnimationLoop() {
    const loop = () => {
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
    const trackEl = this.trackRef?.nativeElement;
    const setEl = this.set1Ref?.nativeElement;

    if (!trackEl || !setEl || this.projects().length <= 1) return;

    const setWidth = setEl.offsetWidth || 1000;
    const offset = ((this.currentScroll % setWidth) + setWidth) % setWidth;

    trackEl.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }
}
