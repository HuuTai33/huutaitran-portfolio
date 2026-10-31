import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoaderComponent } from '../../components/loader/loader.component';
import { LanguageService } from '../../services/language.service';
import { ShopService } from '../../services/shop.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopComponent {
  private readonly shopService = inject(ShopService);
  readonly t = inject(LanguageService).t;

  readonly products = this.shopService.products;
  readonly productImages = this.products.map((p) => p.image);

  formatNumber(n: number): string {
    return String(n).padStart(2, '0');
  }
}
