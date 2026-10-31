import { Injectable, OnDestroy, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BOOKS, FRAME_COLORS, FrameColor, PRINT_DIMENSIONS, PRODUCTS } from './shop.service';

export interface PrintCartItem {
  key: string;
  type: 'print';
  productId: string;
  dimension: string;
  withFrame: boolean;
  frameColor: FrameColor | null;
}

export interface BookCartItem {
  key: string;
  type: 'book';
  productId: string;
  quantity: number;
}

export type CartItem = PrintCartItem | BookCartItem;

export type NewCartItem = Omit<PrintCartItem, 'key' | 'type'>;

interface StoredCart {
  items: CartItem[];
  expiresAt: number;
}

export const CART_STORAGE_KEY = 'huutaitran_cart';
export const CART_TTL_MS = 30 * 60 * 1000;
export const MAX_BOOK_QUANTITY = 10;

function isValidQuantity(q: unknown): q is number {
  return Number.isInteger(q) && (q as number) >= 1 && (q as number) <= MAX_BOOK_QUANTITY;
}

function normalizeItem(item: unknown): CartItem | null {
  if (!item || typeof item !== 'object') return null;
  const i = item as Partial<Omit<PrintCartItem, 'type'> & Omit<BookCartItem, 'type'>> & { type?: unknown };
  if (typeof i.key !== 'string') return null;

  if (i.type === 'book') {
    return BOOKS.some((b) => b.id === i.productId) && isValidQuantity(i.quantity)
      ? { key: i.key, type: 'book', productId: i.productId as string, quantity: i.quantity }
      : null;
  }

  // Items saved before books existed have no type: they are prints.
  if (i.type !== undefined && i.type !== 'print') return null;
  const valid =
    PRODUCTS.some((p) => p.id === i.productId) &&
    PRINT_DIMENSIONS.includes(i.dimension as string) &&
    typeof i.withFrame === 'boolean' &&
    (i.withFrame ? FRAME_COLORS.includes(i.frameColor as FrameColor) : i.frameColor === null);
  return valid
    ? {
        key: i.key,
        type: 'print',
        productId: i.productId as string,
        dimension: i.dimension as string,
        withFrame: i.withFrame as boolean,
        frameColor: (i.frameColor ?? null) as FrameColor | null,
      }
    : null;
}

function createKey(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  readonly items = signal<CartItem[]>([]);
  /** Number of articles: a book line counts for its quantity. */
  readonly count = computed(() =>
    this.items().reduce((total, item) => total + (item.type === 'book' ? item.quantity : 1), 0)
  );
  /** True once the persisted cart has been read on the client. */
  readonly isRestored = signal<boolean>(false);

  constructor() {
    // Restore after hydration so the server-rendered markup (empty cart) matches the first client render.
    afterNextRender(() => this.restore());
  }

  ngOnDestroy() {
    this.clearExpiryTimer();
  }

  add(item: NewCartItem): PrintCartItem {
    const entry: PrintCartItem = {
      ...item,
      type: 'print',
      frameColor: item.withFrame ? item.frameColor : null,
      key: createKey(),
    };
    this.items.update((list) => [...list, entry]);
    this.persist();
    return entry;
  }

  /** Adds a book; if it is already in the cart its quantity is increased (capped at MAX_BOOK_QUANTITY). */
  addBook(productId: string, quantity: number): BookCartItem | null {
    if (!BOOKS.some((b) => b.id === productId)) return null;
    const qty = Math.min(MAX_BOOK_QUANTITY, Math.max(1, Math.floor(quantity)));
    const existing = this.items().find(
      (i): i is BookCartItem => i.type === 'book' && i.productId === productId
    );

    let entry: BookCartItem;
    if (existing) {
      entry = { ...existing, quantity: Math.min(MAX_BOOK_QUANTITY, existing.quantity + qty) };
      this.items.update((list) => list.map((i) => (i.key === existing.key ? entry : i)));
    } else {
      entry = { key: createKey(), type: 'book', productId, quantity: qty };
      this.items.update((list) => [...list, entry]);
    }
    this.persist();
    return entry;
  }

  remove(key: string) {
    this.items.update((list) => list.filter((i) => i.key !== key));
    this.persist();
  }

  clear() {
    this.items.set([]);
    this.persist();
  }

  restore() {
    if (!this.isBrowser) return;
    try {
      this.readStorage();
    } finally {
      this.isRestored.set(true);
    }
  }

  private readStorage() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as StoredCart;
      if (!stored || typeof stored.expiresAt !== 'number' || stored.expiresAt <= Date.now() || !Array.isArray(stored.items)) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return;
      }
      this.items.set(stored.items.map(normalizeItem).filter((i): i is CartItem => i !== null));
      this.scheduleExpiry(stored.expiresAt);
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }

  private persist() {
    if (!this.isBrowser) return;
    try {
      if (this.items().length === 0) {
        localStorage.removeItem(CART_STORAGE_KEY);
        this.clearExpiryTimer();
        return;
      }
      const expiresAt = Date.now() + CART_TTL_MS;
      const stored: StoredCart = { items: this.items(), expiresAt };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(stored));
      this.scheduleExpiry(expiresAt);
    } catch {
      // Storage unavailable (private mode / quota): keep the in-memory cart only.
    }
  }

  private scheduleExpiry(expiresAt: number) {
    this.clearExpiryTimer();
    this.expiryTimer = setTimeout(() => this.clear(), Math.max(0, expiresAt - Date.now()));
  }

  private clearExpiryTimer() {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }
}
