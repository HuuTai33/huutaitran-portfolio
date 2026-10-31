import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { LanguageService } from '../../../services/language.service';
import { ShopService, formatPrice } from '../../../services/shop.service';

interface CartLine {
  key: string;
  productId: string;
  image: string;
  alt: string;
  name: string;
  specs: string[];
  price: string | null;
}

@Component({
  selector: 'app-shop-cart',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './shop-cart.component.html',
  styleUrl: './shop-cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopCartComponent {
  private readonly cartService = inject(CartService);
  private readonly shopService = inject(ShopService);
  private readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;

  readonly isRestored = this.cartService.isRestored;

  readonly lines = computed<CartLine[]>(() => {
    const t = this.t().shop;
    const lang = this.languageService.currentLang();

    return this.cartService.items().flatMap((item): CartLine[] => {
      if (item.type === 'book') {
        const book = this.shopService.getBook(item.productId);
        if (!book) return [];
        const title = book.title[lang];
        return [{
          key: item.key,
          productId: book.id,
          image: book.thumbs[0],
          alt: title,
          name: title,
          specs: [`${t.quantity}${lang === 'FR' ? ' : ' : ': '}${item.quantity}`],
          price: formatPrice(book.price * item.quantity, lang),
        }];
      }

      const product = this.shopService.getProduct(item.productId);
      if (!product) return [];
      const label = `N° ${this.formatNumber(product.number)}`;
      return [{
        key: item.key,
        productId: product.id,
        image: product.thumb,
        alt: `${t.altPrint} ${label}`,
        name: `${t.printLabel} ${label}`,
        specs: [
          item.dimension,
          item.withFrame ? t.withFrame : t.withoutFrame,
          ...(item.frameColor ? [t.frameColors[item.frameColor]] : []),
        ],
        price: null,
      }];
    });
  });

  formatNumber(n: number): string {
    return String(n).padStart(2, '0');
  }

  remove(key: string) {
    this.cartService.remove(key);
  }
}
