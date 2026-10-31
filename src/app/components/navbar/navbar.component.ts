import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PhotosService } from '../../services/photos.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  readonly photosService = inject(PhotosService);
  private readonly router = inject(Router);

  readonly isScrolled = signal<boolean>(false);
  readonly isMobileMenuOpen = signal<boolean>(false);
  readonly currentUrl = signal<string>(this.router.url);

  readonly isHomePage = computed(() => {
    const url = this.currentUrl().split('?')[0].split('#')[0];
    return url === '/' || url === '';
  });

  readonly isPhotographyPage = computed(() => {
    const url = this.currentUrl().split('?')[0].split('#')[0];
    return url === '/photography' || url.startsWith('/photography/');
  });

  readonly isWebDevPage = computed(() => {
    const url = this.currentUrl().split('?')[0].split('#')[0];
    return url === '/web_development' || url.startsWith('/web_development/');
  });

  readonly showPhotography = computed(() => {
    return this.isWebDevPage();
  });

  readonly showWebDevelopment = computed(() => {
    return this.isPhotographyPage();
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      });
  }

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
