import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, PLATFORM_ID, inject, signal } from '@angular/core';
import { PhotosService } from '../../services/photos.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly photosService = inject(PhotosService);

  @Output() readonly completed = new EventEmitter<void>();

  readonly isFadingOut = signal<boolean>(false);
  readonly isHidden = signal<boolean>(false);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // Keep loader rendered in SSR HTML so it is visible immediately upon page delivery
      return;
    }

    this.startPreloading();
  }

  private startPreloading(): void {
    const minDelayMs = 2000;
    const maxTimeoutMs = 12000;
    const startTime = Date.now();

    const allPhotos = this.photosService.allPhotos();
    if (!allPhotos || allPhotos.length === 0) {
      setTimeout(() => this.dismissLoader(), minDelayMs);
      return;
    }

    const preloadPromises = allPhotos.map(photo => {
      return new Promise<void>((resolve) => {
        const src = photo.thumbSrc || photo.src;
        if (!src) {
          resolve();
          return;
        }

        const img = new Image();
        let isResolved = false;

        const onFinish = () => {
          if (isResolved) return;
          isResolved = true;

          if ('decode' in img && typeof img.decode === 'function') {
            img.decode().then(() => resolve()).catch(() => resolve());
          } else {
            resolve();
          }
        };

        img.onload = onFinish;
        img.onerror = () => {
          if (!isResolved) {
            isResolved = true;
            resolve();
          }
        };

        img.src = src;

        if (img.complete) {
          onFinish();
        }
      });
    });

    const allImagesLoaded = Promise.all(preloadPromises);

    const minDelayPromise = new Promise<void>((resolve) => {
      setTimeout(resolve, minDelayMs);
    });

    const safetyTimeoutPromise = new Promise<void>((resolve) => {
      setTimeout(resolve, maxTimeoutMs);
    });

    Promise.race([
      Promise.all([allImagesLoaded, minDelayPromise]),
      safetyTimeoutPromise
    ]).then(() => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minDelayMs - elapsed);

      setTimeout(() => {
        this.dismissLoader();
      }, remainingTime);
    });
  }

  private dismissLoader(): void {
    this.isFadingOut.set(true);
    setTimeout(() => {
      this.isHidden.set(true);
      this.completed.emit();
    }, 600);
  }
}
