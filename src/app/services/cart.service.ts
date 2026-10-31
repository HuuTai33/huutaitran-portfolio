import { Injectable, OnDestroy, PLATFORM_ID, afterNextRender, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FRAME_COLORS, FrameColor, PRINT_DIMENSIONS, PRODUCTS } from './shop.service';

export interface CartItem {
  key: string;
  productId: string;
  dimension: string;
  withFrame: boolean;
  frameColor: FrameColor | null;
}

export type NewCartItem = Omit<CartItem, 'key'>;

interface StoredCart {
  items: CartItem[];
  expiresAt: number;
}

export const CART_STORAGE_KEY = 'huutaitran_cart';
export const CART_TTL_MS = 30 * 60 * 1000;

function isValidItem(item: unknown): item is CartItem {
  if (!item || typeof item !== 'object') return false;
  const i = item as CartItem;
  return (
    typeof i.key === 'string' &&
    PRODUCTS.some((p) => p.id === i.productId) &&
    PRINT_DIMENSIONS.includes(i.dimension) &&
    typeof i.withFrame === 'boolean' &&
    (i.withFrame ? FRAME_COLORS.includes(i.frameColor as FrameColor) : i.frameColor === null)
  );
}

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  readonly items = signal<CartItem[]>([]);
  readonly count = computed(() => this.items().length);
  /** True once the persisted cart has been read on the client. */
  readonly isRestored = signal<boolean>(false);

  constructor() {
    // Restore after hydration so the server-rendered markup (empty cart) matches the first client render.
    afterNextRender(() => this.restore());
  }

  ngOnDestroy() {
    this.clearExpiryTimer();
  }

  add(item: NewCartItem): CartItem {
    const entry: CartItem = {
      ...item,
      frameColor: item.withFrame ? item.frameColor : null,
      key: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    };
    this.items.update((list) => [...list, entry]);
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
      this.items.set(stored.items.filter(isValidItem));
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
