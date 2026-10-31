import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { ShopProductComponent } from './shop-product.component';
import { CartService } from '../../../services/cart.service';
import { ShopService } from '../../../services/shop.service';

describe('ShopProductComponent', () => {
  let fixture: ComponentFixture<ShopProductComponent>;
  let cart: CartService;

  beforeEach(async () => {
    localStorage.clear();
    const paramMap = convertToParamMap({ id: 'frame_4' });
    await TestBed.configureTestingModule({
      imports: [ShopProductComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(paramMap), snapshot: { paramMap } } }
      ]
    }).compileComponents();

    cart = TestBed.inject(CartService);
    cart.clear();
    fixture = TestBed.createComponent(ShopProductComponent);
    fixture.detectChanges();
  });

  it('should render the product image and the dimensions/frame fields', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect((el.querySelector('.product-image') as HTMLImageElement).getAttribute('src'))
      .toBe('/images/products/frames/web/frame - 4.webp');
    const dims = Array.from(el.querySelectorAll('#print-dimension option')).map(o => o.textContent?.trim());
    expect(dims).toEqual(['10 × 15 cm', '13 × 18 cm', '20 × 30 cm', '30 × 45 cm', '40 × 60 cm']);
    expect(el.querySelector('#print-with-frame')).toBeTruthy();
    expect(el.querySelector('#print-frame-color')).toBeNull();
  });

  it('should reveal the frame color field when "Yes" is selected and add the configured item', () => {
    const el = fixture.nativeElement as HTMLElement;
    const dim = el.querySelector('#print-dimension') as HTMLSelectElement;
    dim.value = '30 × 45 cm';
    dim.dispatchEvent(new Event('change'));

    const frame = el.querySelector('#print-with-frame') as HTMLSelectElement;
    frame.value = 'yes';
    frame.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const color = el.querySelector('#print-frame-color') as HTMLSelectElement;
    expect(color).toBeTruthy();
    expect(Array.from(color.options).map(o => o.textContent?.trim())).toEqual(['Black aluminium', 'Silver aluminium']);
    color.value = 'silver';
    color.dispatchEvent(new Event('change'));

    (el.querySelector('.add-to-cart-btn') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(cart.items()).toEqual([
      expect.objectContaining({ productId: 'frame_4', dimension: '30 × 45 cm', withFrame: true, frameColor: 'silver' })
    ]);
    expect(el.querySelector('.added-feedback')?.textContent).toContain('Added to cart');
    cart.clear();
  });
});

describe('ShopProductComponent (book)', () => {
  it('should render the book page for a book id', async () => {
    const paramMap = convertToParamMap({ id: 'book_1' });
    await TestBed.configureTestingModule({
      imports: [ShopProductComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(paramMap), snapshot: { paramMap } } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ShopProductComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-shop-book')).toBeTruthy();
    expect(el.querySelector('#print-dimension')).toBeNull();
    expect(TestBed.inject(ShopService).category()).toBe('books');
  });
});
