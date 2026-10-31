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
import { TextScrambler } from '../../utils/text-scrambler';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly scrambler = new TextScrambler(this.isBrowser);
  readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;

  readonly photographyText = signal(this.t().home.photography);
  readonly webDevText = signal(this.t().home.webDevelopment);

  private isAnimating = false;

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
      this.ngZone.runOutsideAngular(() => this.scheduleNextCycle(3000));
    }
  }

  private scheduleNextCycle(delay: number): void {
    if (this.scrambler.isDestroyed) return;
    this.scrambler.delay(delay).then(() => this.runAnimationSequence());
  }

  private async runAnimationSequence(): Promise<void> {
    if (this.scrambler.isDestroyed || this.isAnimating) return;
    this.isAnimating = true;

    try {
      await this.scramble(this.t().home.photography, (text) => this.photographyText.set(text), 600);
      if (this.scrambler.isDestroyed) return;
      await this.scrambler.delay(180);
      if (this.scrambler.isDestroyed) return;
      await this.scramble(this.t().home.webDevelopment, (text) => this.webDevText.set(text), 700);
    } finally {
      this.isAnimating = false;
      this.scheduleNextCycle(3000);
    }
  }

  onHover(target: 'photography' | 'webDev'): void {
    if (!this.isBrowser || this.scrambler.isDestroyed) return;
    this.ngZone.runOutsideAngular(() => {
      if (target === 'photography') {
        this.scramble(this.t().home.photography, (text) => this.photographyText.set(text), 500);
      } else {
        this.scramble(this.t().home.webDevelopment, (text) => this.webDevText.set(text), 550);
      }
    });
  }

  scramble(originalText: string, updateFn: (val: string) => void, duration = 600): Promise<void> {
    return this.scrambler.scramble(originalText, updateFn, duration);
  }

  private cleanup(): void {
    this.scrambler.destroy();
    this.photographyText.set(this.t().home.photography);
    this.webDevText.set(this.t().home.webDevelopment);
  }
}
