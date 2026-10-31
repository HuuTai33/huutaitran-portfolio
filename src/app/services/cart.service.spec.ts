import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CART_STORAGE_KEY, CART_TTL_MS, CartService, MAX_BOOK_QUANTITY, PrintCartItem } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('should add and remove items and persist them', () => {
    const a = service.add({ productId: 'frame_1', dimension: '10 × 15 cm', withFrame: false, frameColor: null });
    service.add({ productId: 'frame_3', dimension: '40 × 60 cm', withFrame: true, frameColor: 'silver' });
    expect(service.count()).toBe(2);

    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!);
    expect(stored.items.length).toBe(2);
    expect(stored.expiresAt).toBeGreaterThan(Date.now());

    service.remove(a.key);
    expect(service.count()).toBe(1);
    expect((service.items()[0] as PrintCartItem).frameColor).toBe('silver');
  });

  it('should add books with a quantity, merge repeated adds and count each copy', () => {
    service.add({ productId: 'frame_1', dimension: '10 × 15 cm', withFrame: false, frameColor: null });
    service.addBook('book_1', 2);
    service.addBook('book_1', 3);

    expect(service.items().length).toBe(2);
    expect(service.items()[1]).toEqual(expect.objectContaining({ type: 'book', productId: 'book_1', quantity: 5 }));
    expect(service.count()).toBe(6);

    service.addBook('book_1', 50);
    expect(service.items()[1]).toEqual(expect.objectContaining({ quantity: MAX_BOOK_QUANTITY }));
    expect(service.addBook('unknown', 1)).toBeNull();
  });

  it('should restore books and legacy print items without a type', () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      items: [
        { key: 'a', productId: 'frame_1', dimension: '10 × 15 cm', withFrame: false, frameColor: null },
        { key: 'b', type: 'book', productId: 'book_1', quantity: 2 },
        { key: 'c', type: 'book', productId: 'book_1', quantity: 0 },
      ],
      expiresAt: Date.now() + CART_TTL_MS,
    }));
    service.restore();
    expect(service.items().map((i) => [i.key, i.type])).toEqual([['a', 'print'], ['b', 'book']]);
    expect(service.count()).toBe(3);
  });

  it('should drop the frame color when no frame is selected', () => {
    const item = service.add({ productId: 'frame_1', dimension: '10 × 15 cm', withFrame: false, frameColor: 'black' });
    expect(item.frameColor).toBeNull();
  });

  it('should restore a non-expired cart from storage', () => {
    service.add({ productId: 'frame_2', dimension: '13 × 18 cm', withFrame: true, frameColor: 'black' });
    service.items.set([]);
    service.restore();
    expect(service.count()).toBe(1);
    expect(service.isRestored()).toBe(true);
  });

  it('should discard the cart after 30 minutes', () => {
    vi.useFakeTimers();
    service.add({ productId: 'frame_2', dimension: '13 × 18 cm', withFrame: false, frameColor: null });

    vi.advanceTimersByTime(CART_TTL_MS + 1);
    expect(service.count()).toBe(0);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });

  it('should ignore an expired stored cart on restore', () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      items: [{ key: 'k', productId: 'frame_1', dimension: '10 × 15 cm', withFrame: false, frameColor: null }],
      expiresAt: Date.now() - 1,
    }));
    service.restore();
    expect(service.count()).toBe(0);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });

  it('should filter out invalid stored items', () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      items: [
        { key: 'a', productId: 'frame_1', dimension: '10 × 15 cm', withFrame: false, frameColor: null },
        { key: 'b', productId: 'unknown', dimension: '10 × 15 cm', withFrame: false, frameColor: null },
      ],
      expiresAt: Date.now() + 1000,
    }));
    service.restore();
    expect(service.items().map((i) => i.key)).toEqual(['a']);
  });
});
