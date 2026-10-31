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
    path: '**',
    redirectTo: '',
  },
];
