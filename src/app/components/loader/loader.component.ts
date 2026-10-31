import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, PLATFORM_ID, inject, signal } from '@angular/core';
import { PhotosService } from '../../services/photos.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly photosService = inject(PhotosService);
  readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;

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
    const maxTimeoutMs = 6000;
    const startTime = Date.now();

    const allPhotos = this.photosService.photos();
    if (!allPhotos || allPhotos.length === 0) {
      setTimeout(() => this.dismissLoader(), minDelayMs);
      return;
    }

    // Preload only the critical above-the-fold photos for fast first render
    const criticalPhotos = allPhotos.slice(0, 6);
    const preloadPromises = criticalPhotos.map(src => {
      return new Promise<void>((resolve) => {
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

    const initialImagesLoaded = Promise.all(preloadPromises);

    const minDelayPromise = new Promise<void>((resolve) => {
      setTimeout(resolve, minDelayMs);
    });

    const safetyTimeoutPromise = new Promise<void>((resolve) => {
      setTimeout(resolve, maxTimeoutMs);
    });

    Promise.race([
      Promise.all([initialImagesLoaded, minDelayPromise]),
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
