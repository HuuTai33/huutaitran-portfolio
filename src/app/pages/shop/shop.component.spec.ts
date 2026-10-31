import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ShopComponent } from './shop.component';

describe('ShopComponent', () => {
  let fixture: ComponentFixture<ShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ShopComponent);
    fixture.detectChanges();
  });

  it('should render the loader, title and a card per print', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-loader')).toBeTruthy();
    expect(el.querySelector('.shop-title')?.textContent?.trim()).toBe('Prints');
    expect(el.querySelectorAll('.print-card').length).toBe(10);
  });

  it('should link "View prices" to the product page', () => {
    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('.view-prices-btn') as HTMLAnchorElement;
    expect(btn.textContent?.trim()).toBe('View prices');
    expect(btn.getAttribute('href')).toBe('/shop/frame_1');
    const img = el.querySelector('.print-image') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/images/products/frames/converted_webp/frame - 1.webp');
  });
});
