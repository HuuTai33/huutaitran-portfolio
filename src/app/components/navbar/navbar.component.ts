import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { PhotosService } from '../../services/photos.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  readonly photosService = inject(PhotosService);
  readonly isScrolled = signal<boolean>(false);
  readonly isMobileMenuOpen = signal<boolean>(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (typeof window !== 'undefined') {
      this.isScrolled.set(window.scrollY > 40);
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  openAbout(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.closeMobileMenu();
    this.photosService.openAbout();
  }

  scrollToTop(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.closeMobileMenu();
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      // Also notify any custom scroll canvas
      window.dispatchEvent(new CustomEvent('reset-gallery-scroll'));
    }
  }
}
