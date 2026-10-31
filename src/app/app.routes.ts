import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'HuuTai Tran',
  },
  {
    path: 'photography',
    loadComponent: () =>
      import('./pages/photography/photography.component').then(
        (m) => m.PhotographyComponent
      ),
    title: 'HuuTai Tran',
  },
  {
    path: 'web_development',
    loadComponent: () =>
      import('./pages/web-development/web-development.component').then(
        (m) => m.WebDevelopmentComponent
      ),
    title: 'HuuTai Tran',
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./pages/shop/shop.component').then((m) => m.ShopComponent),
    title: 'HuuTai Tran',
  },
  {
    path: 'shop/cart',
    loadComponent: () =>
      import('./pages/shop/cart/shop-cart.component').then(
        (m) => m.ShopCartComponent
      ),
    title: 'HuuTai Tran',
  },
  {
    path: 'shop/:id',
    loadComponent: () =>
      import('./pages/shop/product/shop-product.component').then(
        (m) => m.ShopProductComponent
      ),
    title: 'HuuTai Tran',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
