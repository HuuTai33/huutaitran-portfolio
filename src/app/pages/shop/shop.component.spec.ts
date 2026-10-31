import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ShopComponent } from './shop.component';
import { ShopService } from '../../services/shop.service';

describe('ShopComponent', () => {
  let fixture: ComponentFixture<ShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    TestBed.inject(ShopService).category.set('prints');
    fixture = TestBed.createComponent(ShopComponent);
    fixture.detectChanges();
  });

  it('should render the loader, the "Prints | Books" switch and a card per print by default', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-loader')).toBeTruthy();
    const categories = Array.from(el.querySelectorAll('.category-link'));
    expect(categories.map((c) => c.getAttribute('aria-label'))).toEqual(['Prints', 'Books']);
    expect(categories[0].getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('.category-divider')?.textContent?.trim()).toBe('|');
    expect(el.querySelectorAll('.shop-card').length).toBe(10);
  });

  it('should link "View prices" to the print page', () => {
    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('.view-prices-btn') as HTMLAnchorElement;
    expect(btn.textContent?.trim()).toBe('View prices');
    expect(btn.getAttribute('href')).toBe('/shop/frame_1');
    const img = el.querySelector('.shop-card-image') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/images/products/frames/converted_webp/frame - 1.webp');
  });

  it('should show the books with their cover and a "View price" button when "Books" is selected', async () => {
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelectorAll('.category-link')[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(el.querySelectorAll('.category-link')[1].getAttribute('aria-pressed')).toBe('true');
    const cards = el.querySelectorAll('.shop-card');
    expect(cards.length).toBe(1);
    expect(cards[0].querySelector('img')?.getAttribute('src')).toBe('/images/products/books/converted_webp/book 1 - 1.webp');
    const btn = cards[0].querySelector('.view-prices-btn') as HTMLAnchorElement;
    expect(btn.textContent?.trim()).toBe('View price');
    expect(btn.getAttribute('href')).toBe('/shop/book_1');
  });
});
