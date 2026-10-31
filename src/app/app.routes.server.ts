import { RenderMode, ServerRoute } from '@angular/ssr';
import { PRODUCTS } from './services/shop.service';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'shop/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return PRODUCTS.map((p) => ({ id: p.id }));
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
