import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { CartService } from '../../../services/cart.service';
import { LanguageService } from '../../../services/language.service';
import { FrameColor, ShopService } from '../../../services/shop.service';
import { ShopBookComponent } from '../book/shop-book.component';

@Component({
  selector: 'app-shop-product',
  standalone: true,
  imports: [RouterLink, ShopBookComponent],
  templateUrl: './shop-product.component.html',
  styleUrl: './shop-product.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopProductComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly shopService = inject(ShopService);
  private readonly cartService = inject(CartService);
  readonly t = inject(LanguageService).t;

  readonly dimensions = this.shopService.dimensions;
  readonly frameColors = this.shopService.frameColors;

  private readonly productId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))), {
    initialValue: this.route.snapshot.paramMap.get('id'),
  });
  readonly product = computed(() => this.shopService.getProduct(this.productId()));
  readonly book = computed(() => this.shopService.getBook(this.productId()));

  readonly dimension = signal<string>(this.dimensions[0]);
  readonly withFrame = signal<boolean>(false);
  readonly frameColor = signal<FrameColor>(this.frameColors[0]);
  readonly justAdded = signal<boolean>(false);

  private addedTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      // Remember the category so "back" from a product returns to the matching list on /shop.
      if (this.product()) {
        this.shopService.category.set('prints');
      } else if (this.book()) {
        this.shopService.category.set('books');
      } else {
        this.router.navigate(['/shop'], { replaceUrl: true });
      }
    });
  }

  ngOnDestroy() {
    if (this.addedTimer) clearTimeout(this.addedTimer);
  }

  formatNumber(n: number): string {
    return String(n).padStart(2, '0');
  }

  onDimensionChange(event: Event) {
    this.dimension.set((event.target as HTMLSelectElement).value);
    this.justAdded.set(false);
  }

  onWithFrameChange(event: Event) {
    this.withFrame.set((event.target as HTMLSelectElement).value === 'yes');
    this.justAdded.set(false);
  }

  onFrameColorChange(event: Event) {
    this.frameColor.set((event.target as HTMLSelectElement).value as FrameColor);
    this.justAdded.set(false);
  }

  addToCart() {
    const product = this.product();
    if (!product) return;

    this.cartService.add({
      productId: product.id,
      dimension: this.dimension(),
      withFrame: this.withFrame(),
      frameColor: this.withFrame() ? this.frameColor() : null,
    });

    this.justAdded.set(true);
    if (this.addedTimer) clearTimeout(this.addedTimer);
    this.addedTimer = setTimeout(() => this.justAdded.set(false), 4000);
  }
}
