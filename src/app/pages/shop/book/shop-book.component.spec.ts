import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ShopBookComponent } from './shop-book.component';
import { CartService } from '../../../services/cart.service';
import { BOOKS } from '../../../services/shop.service';

describe('ShopBookComponent', () => {
  let fixture: ComponentFixture<ShopBookComponent>;
  let cart: CartService;
  const book = BOOKS[0];

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ShopBookComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    cart = TestBed.inject(CartService);
    cart.clear();
    fixture = TestBed.createComponent(ShopBookComponent);
    fixture.componentRef.setInput('book', book);
    fixture.detectChanges();
  });

  it('should render every photo of the book in the carousel with the title, description and price', () => {
    const el = fixture.nativeElement as HTMLElement;
    const slides = Array.from(el.querySelectorAll('.carousel-image')).map((img) => img.getAttribute('src'));
    expect(slides).toEqual(Array.from({ length: 8 }, (_, i) => `/images/products/books/converted_webp/book 1 - ${i + 1}.webp`));
    expect(el.querySelector('.product-title')?.textContent?.trim()).toBe(book.title.EN);
    expect(el.querySelector('.book-description')?.textContent?.trim()).toBe(book.description.EN);
    expect(el.querySelector('.book-price')?.textContent?.trim()).toBe(`€${book.price}.00`);
    expect(el.querySelector('.carousel-counter')?.textContent?.trim()).toBe('01 / 08');
  });

  it('should navigate the carousel with the arrows and thumbnails, wrapping around', () => {
    const el = fixture.nativeElement as HTMLElement;
    const track = el.querySelector('.carousel-track') as HTMLElement;

    (el.querySelector('.carousel-nav.prev') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('.carousel-counter')?.textContent?.trim()).toBe('08 / 08');
    expect(track.style.transform).toBe('translateX(-700%)');

    (el.querySelector('.carousel-nav.next') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(track.style.transform).toBe('translateX(-0%)');

    (el.querySelectorAll('.thumb')[2] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('.carousel-counter')?.textContent?.trim()).toBe('03 / 08');
    expect(el.querySelectorAll('.thumb')[2].classList).toContain('active');
  });

  it('should add the chosen quantity to the cart', () => {
    const el = fixture.nativeElement as HTMLElement;
    const [minus, plus] = Array.from(el.querySelectorAll('.quantity-btn')) as HTMLButtonElement[];
    expect(minus.disabled).toBe(true);
    plus.click();
    plus.click();
    fixture.detectChanges();
    expect((el.querySelector('#book-quantity') as HTMLInputElement).value).toBe('3');

    (el.querySelector('.add-to-cart-btn') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(cart.items()).toEqual([expect.objectContaining({ type: 'book', productId: 'book_1', quantity: 3 })]);
    expect(cart.count()).toBe(3);
    expect(el.querySelector('.added-feedback')?.textContent).toContain('Added to cart');
    cart.clear();
  });
});
