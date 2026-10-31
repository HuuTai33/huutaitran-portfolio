import { Injectable } from '@angular/core';

export interface Product {
  id: string;
  number: number;
  image: string;
}

export type FrameColor = 'black' | 'silver';

const TOTAL_PRODUCTS = 10;

export const PRODUCTS: readonly Product[] = Array.from({ length: TOTAL_PRODUCTS }, (_, i) => ({
  id: `frame_${i + 1}`,
  number: i + 1,
  image: `/images/products/frames/converted_webp/frame - ${i + 1}.webp`,
}));

export const PRINT_DIMENSIONS: readonly string[] = [
  '10 × 15 cm',
  '13 × 18 cm',
  '20 × 30 cm',
  '30 × 45 cm',
  '40 × 60 cm',
];

export const FRAME_COLORS: readonly FrameColor[] = ['black', 'silver'];

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  readonly products = PRODUCTS;
  readonly dimensions = PRINT_DIMENSIONS;
  readonly frameColors = FRAME_COLORS;

  getProduct(id: string | null | undefined): Product | undefined {
    return this.products.find((p) => p.id === id);
  }
}
