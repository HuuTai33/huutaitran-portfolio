import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { PhotosService } from '../../services/photos.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {
  readonly photosService = inject(PhotosService);
  readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;

  @HostListener('window:keydown.escape')
  onEscape() {
    if (this.photosService.isAboutOpen()) {
      this.close();
    }
  }

  close() {
    this.photosService.closeAbout();
  }
}
