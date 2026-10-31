import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PhotosService } from '../../services/photos.service';
import { Language, LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit, OnDestroy {
  readonly photosService = inject(PhotosService);
  readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly currentLang = this.languageService.currentLang;
  readonly t = this.languageService.t;
  readonly isScrolled = signal<boolean>(false);
  readonly isMobileMenuOpen = this.photosService.isMobileMenuOpen;
  readonly currentUrl = signal<string>(this.router.url);

  private boundScrollListener?: () => void;

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

  ngOnInit() {
    if (!this.isBrowser) return;

    this.zone.runOutsideAngular(() => {
      this.boundScrollListener = () => {
        const scrolled = window.scrollY > 40;
        if (this.isScrolled() !== scrolled) {
          this.zone.run(() => {
            this.isScrolled.set(scrolled);
          });
        }
      };

      window.addEventListener('scroll', this.boundScrollListener, { passive: true });
    });
  }

  ngOnDestroy() {
    this.closeMobileMenu();
    if (this.isBrowser) {
      if (this.boundScrollListener) {
        window.removeEventListener('scroll', this.boundScrollListener);
      }
      this.updateBodyScrollLock(false);
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => {
      const next = !v;
      this.updateBodyScrollLock(next);
      return next;
    });
  }

  closeMobileMenu() {
    if (this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
      this.updateBodyScrollLock(false);
    }
  }

  private updateBodyScrollLock(locked: boolean) {
    if (!this.isBrowser) return;
    if (locked) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else if (!this.photosService.isAboutOpen() && !this.photosService.isLightboxOpen()) {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }

  setLanguage(lang: Language) {
    this.languageService.setLanguage(lang);
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
