import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GalleryComponent } from '../../components/gallery/gallery.component';
import { LightboxComponent } from '../../components/lightbox/lightbox.component';
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-photography',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    GalleryComponent,
    LightboxComponent
  ],
  templateUrl: './photography.component.html',
  styleUrl: './photography.component.scss'
})
export class PhotographyComponent {}
