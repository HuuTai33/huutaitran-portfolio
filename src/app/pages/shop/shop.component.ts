import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  NgZone,
  OnInit,
  PLATFORM_ID,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoaderComponent } from '../../components/loader/loader.component';
import { LanguageService } from '../../services/language.service';
import { ShopCategory, ShopService } from '../../services/shop.service';
import { TextScrambler } from '../../utils/text-scrambler';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopComponent implements OnInit {
  private readonly shopService = inject(ShopService);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly scrambler = new TextScrambler(this.isBrowser);
  private isCycling = false;

  readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;
  readonly lang = this.languageService.currentLang;

  readonly category = this.shopService.category;
  readonly products = this.shopService.products;
  readonly books = this.shopService.books;
  readonly productImages = [...this.products.map((p) => p.thumb), ...this.books.map((b) => b.thumbs[0])];

  readonly printsText = signal(this.t().shop.categories.prints);
  readonly booksText = signal(this.t().shop.categories.books);

  constructor() {
    effect(() => {
      const categories = this.t().shop.categories;
      untracked(() => {
        this.printsText.set(categories.prints);
        this.booksText.set(categories.books);
      });
    });
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.destroyRef.onDestroy(() => this.scrambler.destroy());
    this.ngZone.runOutsideAngular(() => this.scheduleNextCycle(3000));
  }

  selectCategory(category: ShopCategory): void {
    if (this.category() === category) return;
    this.category.set(category);
    this.animate(category, 550);
  }

  onHover(category: ShopCategory): void {
    this.animate(category, 500);
  }

  formatNumber(n: number): string {
    return String(n).padStart(2, '0');
  }

  private animate(category: ShopCategory, duration: number): Promise<void> {
    const text = this.t().shop.categories[category];
    const target = category === 'prints' ? this.printsText : this.booksText;
    return this.ngZone.runOutsideAngular(() => this.scrambler.scramble(text, (v) => target.set(v), duration));
  }

  private scheduleNextCycle(delay: number): void {
    this.scrambler.delay(delay).then(() => this.runCycle());
  }

  private async runCycle(): Promise<void> {
    if (this.scrambler.isDestroyed || this.isCycling) return;
    this.isCycling = true;
    try {
      await this.animate('prints', 600);
      await this.scrambler.delay(180);
      await this.animate('books', 700);
    } finally {
      this.isCycling = false;
      if (!this.scrambler.isDestroyed) this.scheduleNextCycle(3000);
    }
  }
}
