import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService, MAX_BOOK_QUANTITY } from '../../../services/cart.service';
import { LanguageService } from '../../../services/language.service';
import { Book, formatPrice } from '../../../services/shop.service';

const SWIPE_THRESHOLD_PX = 40;

@Component({
  selector: 'app-shop-book',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './shop-book.component.html',
  styleUrl: './shop-book.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopBookComponent implements OnDestroy {
  private readonly cartService = inject(CartService);
  private readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;
  readonly lang = this.languageService.currentLang;

  readonly book = input.required<Book>();

  readonly maxQuantity = MAX_BOOK_QUANTITY;
  readonly index = signal(0);
  readonly quantity = signal(1);
  readonly justAdded = signal(false);

  readonly imageCount = computed(() => this.book().images.length);
  /** Slides whose image may be requested: visited ones and their neighbours (preloaded for instant navigation). */
  readonly loadedSlides = signal<ReadonlySet<number>>(new Set());
  readonly price = computed(() => formatPrice(this.book().price, this.lang()));

  private pointerStartX: number | null = null;
  private addedTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.book();
      this.index.set(0);
      this.loadedSlides.set(this.withNeighbours(new Set(), 0));
      this.quantity.set(1);
      this.justAdded.set(false);
    });
  }

  ngOnDestroy() {
    if (this.addedTimer) clearTimeout(this.addedTimer);
  }

  formatNumber(n: number): string {
    return String(n).padStart(2, '0');
  }

  goTo(i: number) {
    const count = this.imageCount();
    const index = ((i % count) + count) % count;
    this.index.set(index);
    this.loadedSlides.update((loaded) => this.withNeighbours(loaded, index));
  }

  previous() {
    this.goTo(this.index() - 1);
  }

  next() {
    this.goTo(this.index() + 1);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previous();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }

  onPointerDown(event: PointerEvent) {
    this.pointerStartX = event.clientX;
  }

  onPointerUp(event: PointerEvent) {
    if (this.pointerStartX === null) return;
    const delta = event.clientX - this.pointerStartX;
    this.pointerStartX = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0) {
      this.next();
    } else {
      this.previous();
    }
  }

  onPointerCancel() {
    this.pointerStartX = null;
  }

  decrement() {
    this.setQuantity(this.quantity() - 1);
  }

  increment() {
    this.setQuantity(this.quantity() + 1);
  }

  onQuantityInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.setQuantity(Number(input.value));
    input.value = String(this.quantity());
  }

  addToCart() {
    this.cartService.addBook(this.book().id, this.quantity());
    this.justAdded.set(true);
    if (this.addedTimer) clearTimeout(this.addedTimer);
    this.addedTimer = setTimeout(() => this.justAdded.set(false), 4000);
  }

  private withNeighbours(loaded: ReadonlySet<number>, index: number): ReadonlySet<number> {
    const count = this.imageCount();
    const wanted = [index, (index + 1) % count, (index - 1 + count) % count];
    if (wanted.every((i) => loaded.has(i))) return loaded;
    return new Set([...loaded, ...wanted]);
  }

  private setQuantity(value: number) {
    const q = Number.isFinite(value) ? Math.floor(value) : 1;
    this.quantity.set(Math.min(this.maxQuantity, Math.max(1, q)));
    this.justAdded.set(false);
  }
}
