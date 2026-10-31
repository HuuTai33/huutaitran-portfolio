import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem, CartService } from '../../../services/cart.service';
import { LanguageService } from '../../../services/language.service';
import { Product, ShopService } from '../../../services/shop.service';

interface CartLine extends CartItem {
  product: Product;
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
  readonly t = inject(LanguageService).t;

  readonly isRestored = this.cartService.isRestored;

  readonly lines = computed<CartLine[]>(() =>
    this.cartService.items().flatMap((item) => {
      const product = this.shopService.getProduct(item.productId);
      return product ? [{ ...item, product }] : [];
    })
  );

  formatNumber(n: number): string {
    return String(n).padStart(2, '0');
  }

  remove(key: string) {
    this.cartService.remove(key);
  }
}
