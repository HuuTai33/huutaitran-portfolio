import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PhotographyComponent } from './pages/photography/photography.component';
import { WebDevelopmentComponent } from './pages/web-development/web-development.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'HuuTai Tran'
  },
  {
    path: 'photography',
    component: PhotographyComponent,
    title: 'Photography — HuuTai Tran'
  },
  {
    path: 'web_development',
    component: WebDevelopmentComponent,
    title: 'Web development — HuuTai Tran'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
