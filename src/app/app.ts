import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AboutComponent } from './components/about/about.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { LightboxComponent } from './components/lightbox/lightbox.component';
import { LoaderComponent } from './components/loader/loader.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PhotosService } from './services/photos.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    NavbarComponent,
    GalleryComponent,
    LightboxComponent,
    AboutComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly photosService = inject(PhotosService);
}
