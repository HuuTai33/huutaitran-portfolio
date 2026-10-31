import { Injectable, signal } from '@angular/core';
import type { Language } from './language.service';

export interface Product {
  id: string;
  number: number;
  /** Product page image (max 1600px). */
  image: string;
  /** Grid / cart image (max 800px). */
  thumb: string;
}

export interface Book {
  id: string;
  number: number;
  title: Record<Language, string>;
  description: Record<Language, string>;
  /** Unit price in euros. */
  price: number;
  /** All photos of the book (max 1600px); the first one is used as cover. */
  images: readonly string[];
  /** Same photos in max 800px, for the grid, carousel thumbnails and cart. */
  thumbs: readonly string[];
}

export type FrameColor = 'black' | 'silver';
export type ShopCategory = 'prints' | 'books';

// Images are generated from each "converted_webp" folder by `npm run optimize:images`.
const FRAMES_DIR = '/images/products/frames';
const BOOKS_DIR = '/images/products/books';

const TOTAL_PRODUCTS = 10;

export const PRODUCTS: readonly Product[] = Array.from({ length: TOTAL_PRODUCTS }, (_, i) => ({
  id: `frame_${i + 1}`,
  number: i + 1,
  image: `${FRAMES_DIR}/web/frame - ${i + 1}.webp`,
  thumb: `${FRAMES_DIR}/thumbs/frame - ${i + 1}.webp`,
}));

// Book N uses the photos "book N - 1.webp", "book N - 2.webp", ... (imageCount of them).
// TODO: title, description and price are placeholders, replace them with the real values.
interface BookDefinition extends Omit<Book, 'id' | 'images' | 'thumbs'> {
  imageCount: number;
}

const BOOK_DEFINITIONS: readonly BookDefinition[] = [
  {
    number: 1,
    imageCount: 8,
    title: { EN: 'Photo book N° 01', FR: 'Livre photo N° 01' },
    description: {
      EN: 'Photo book. Description coming soon.',
      FR: 'Livre photographique. Description à venir.',
    },
    price: 35,
  },
];

export const BOOKS: readonly Book[] = BOOK_DEFINITIONS.map(({ imageCount, ...book }) => {
  const files = Array.from({ length: imageCount }, (_, i) => `book ${book.number} - ${i + 1}.webp`);
  return {
    ...book,
    id: `book_${book.number}`,
    images: files.map((f) => `${BOOKS_DIR}/web/${f}`),
    thumbs: files.map((f) => `${BOOKS_DIR}/thumbs/${f}`),
  };
});

export const PRINT_DIMENSIONS: readonly string[] = [
  '10 × 15 cm',
  '13 × 18 cm',
  '20 × 30 cm',
  '30 × 45 cm',
  '40 × 60 cm',
];

export const FRAME_COLORS: readonly FrameColor[] = ['black', 'silver'];

export function formatPrice(amount: number, lang: Language): string {
  return new Intl.NumberFormat(lang === 'FR' ? 'fr-FR' : 'en-GB', { style: 'currency', currency: 'EUR' }).format(amount);
}

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  readonly products = PRODUCTS;
  readonly books = BOOKS;
  readonly dimensions = PRINT_DIMENSIONS;
  readonly frameColors = FRAME_COLORS;

  /** Category displayed on /shop; remembered while navigating so "back" returns to the same list. */
  readonly category = signal<ShopCategory>('prints');

  getProduct(id: string | null | undefined): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  getBook(id: string | null | undefined): Book | undefined {
    return this.books.find((b) => b.id === id);
  }
}
