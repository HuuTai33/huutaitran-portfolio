import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ShopCartComponent } from './shop-cart.component';
import { CartService } from '../../../services/cart.service';

describe('ShopCartComponent', () => {
  let fixture: ComponentFixture<ShopCartComponent>;
  let cart: CartService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ShopCartComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    cart = TestBed.inject(CartService);
    cart.clear();
    cart.restore();
    fixture = TestBed.createComponent(ShopCartComponent);
    fixture.detectChanges();
  });

  it('should show an empty state when the cart is empty', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cart-empty-text')?.textContent?.trim()).toBe('Your cart is empty');
    expect(el.querySelector('.checkout-btn')).toBeNull();
  });

  it('should list items with their options and allow removing them', () => {
    cart.add({ productId: 'frame_1', dimension: '10 × 15 cm', withFrame: false, frameColor: null });
    cart.add({ productId: 'frame_2', dimension: '40 × 60 cm', withFrame: true, frameColor: 'black' });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('.cart-item');
    expect(items.length).toBe(2);

    const specs = (i: number) => Array.from(items[i].querySelectorAll('.cart-item-specs li')).map(li => li.textContent?.trim());
    expect(specs(0)).toEqual(['10 × 15 cm', 'Without frame']);
    expect(specs(1)).toEqual(['40 × 60 cm', 'With frame', 'Black aluminium']);
    expect(items[0].querySelector('img')?.getAttribute('src')).toBe('/images/products/frames/converted_webp/frame - 1.webp');
    expect(el.querySelector('.checkout-btn')?.textContent?.trim()).toBe('Proceed to checkout');

    (items[0].querySelector('.remove-btn') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.cart-item').length).toBe(1);
    expect(cart.count()).toBe(1);
    cart.clear();
  });
});
