import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  NgZone,
  OnInit,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;

  readonly photographyText = signal(this.t().home.photography);
  readonly webDevText = signal(this.t().home.webDevelopment);

  private readonly chars = '!<>-_\\/[]{}—=+*^?#_~@0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  private activeFrameIds = new Set<number>();
  private activeTimeouts = new Set<ReturnType<typeof setTimeout>>();
  private isAnimating = false;
  private isDestroyed = false;

  constructor() {
    effect(() => {
      const currentT = this.t();
      if (!this.isAnimating) {
        this.photographyText.set(currentT.home.photography);
        this.webDevText.set(currentT.home.webDevelopment);
      }
    });
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.destroyRef.onDestroy(() => this.cleanup());
      this.ngZone.runOutsideAngular(() => {
        this.scheduleNextCycle(3000);
      });
    }
  }

  private scheduleNextCycle(delay: number): void {
    if (this.isDestroyed) return;
    const timeout = setTimeout(() => {
      this.activeTimeouts.delete(timeout);
      this.runAnimationSequence();
    }, delay);
    this.activeTimeouts.add(timeout);
  }

  private async runAnimationSequence(): Promise<void> {
    if (this.isDestroyed || this.isAnimating) return;
    this.isAnimating = true;

    try {
      // 1. Animer "Photography"
      await this.scramble(this.t().home.photography, (text) => this.photographyText.set(text), 600);

      if (this.isDestroyed) return;

      // Pause entre les deux animations
      await this.delay(180);

      if (this.isDestroyed) return;

      // 2. Animer "Web development"
      await this.scramble(this.t().home.webDevelopment, (text) => this.webDevText.set(text), 700);
    } finally {
      this.isAnimating = false;
      if (!this.isDestroyed) {
        this.scheduleNextCycle(3000);
      }
    }
  }

  onHover(target: 'photography' | 'webDev'): void {
    if (!this.isBrowser || this.isDestroyed) return;
    this.ngZone.runOutsideAngular(() => {
      if (target === 'photography') {
        this.scramble(this.t().home.photography, (text) => this.photographyText.set(text), 500);
      } else {
        this.scramble(this.t().home.webDevelopment, (text) => this.webDevText.set(text), 550);
      }
    });
  }

  scramble(
    originalText: string,
    updateFn: (val: string) => void,
    duration = 600
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isBrowser || this.isDestroyed) {
        updateFn(originalText);
        resolve();
        return;
      }

      const length = originalText.length;
      const startTime = performance.now();
      const encryptDuration = Math.min(150, duration * 0.25);
      const decryptDuration = duration - encryptDuration;
      let frameId: number;

      const update = (now: number) => {
        if (this.isDestroyed) {
          updateFn(originalText);
          resolve();
          return;
        }

        const elapsed = now - startTime;

        if (elapsed < encryptDuration) {
          // Phase 1 : Cryptage total en caractères aléatoires
          let result = '';
          for (let i = 0; i < length; i++) {
            result += originalText[i] === ' ' ? ' ' : this.getRandomChar();
          }
          updateFn(result);
          frameId = requestAnimationFrame(update);
          this.activeFrameIds.add(frameId);
        } else {
          // Phase 2 : Décryptage progressif de gauche à droite
          const decryptElapsed = elapsed - encryptDuration;
          const progress = Math.min(decryptElapsed / decryptDuration, 1);
          const resolvedCount = Math.floor(progress * length);

          let result = '';
          for (let i = 0; i < length; i++) {
            if (originalText[i] === ' ') {
              result += ' ';
            } else if (i < resolvedCount) {
              result += originalText[i];
            } else {
              result += this.getRandomChar();
            }
          }

          updateFn(result);

          if (progress < 1) {
            frameId = requestAnimationFrame(update);
            this.activeFrameIds.add(frameId);
          } else {
            updateFn(originalText);
            this.activeFrameIds.delete(frameId);
            resolve();
          }
        }
      };

      frameId = requestAnimationFrame(update);
      this.activeFrameIds.add(frameId);
    });
  }

  private getRandomChar(): string {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.activeTimeouts.delete(timeout);
        resolve();
      }, ms);
      this.activeTimeouts.add(timeout);
    });
  }

  private cleanup(): void {
    this.isDestroyed = true;
    for (const frameId of this.activeFrameIds) {
      cancelAnimationFrame(frameId);
    }
    this.activeFrameIds.clear();

    for (const timeout of this.activeTimeouts) {
      clearTimeout(timeout);
    }
    this.activeTimeouts.clear();

    this.photographyText.set(this.t().home.photography);
    this.webDevText.set(this.t().home.webDevelopment);
  }
}
