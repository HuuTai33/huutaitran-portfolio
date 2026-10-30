import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { PhotosService } from '../../services/photos.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  readonly photosService = inject(PhotosService);

  @HostListener('window:keydown.escape')
  onEscape() {
    if (this.photosService.isAboutOpen()) {
      this.close();
    }
  }

  close() {
    this.photosService.closeAbout();
  }

  readonly services = [
    {
      num: '01',
      title: "Tirages d'Art Signés",
      desc: "Éditions limitées et numérotées, imprimées sur papier fine art Hahnemühle Photo Rag Baryta avec encres pigmentaires pour une longévité muséale."
    },
    {
      num: '02',
      title: 'Reportages & Éditorial',
      desc: 'Collaborations pour la presse, l’édition, l’architecture d’intérieur et les marques en quête d’une narration visuelle cinématographique.'
    },
    {
      num: '03',
      title: 'Direction Artistique & Série',
      desc: 'Conception de projets sur mesure, repérages urbains, travail minutieux de la colorimétrie et capture de l’atmosphère des grandes métropoles.'
    }
  ];
}
