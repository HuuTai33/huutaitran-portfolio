import { RenderMode, ServerRoute } from '@angular/ssr';
import { BOOKS, PRODUCTS } from './services/shop.service';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'shop/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [...PRODUCTS, ...BOOKS].map((p) => ({ id: p.id }));
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
