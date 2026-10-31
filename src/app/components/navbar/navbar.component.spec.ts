import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavbarComponent } from './navbar.component';
import { PhotosService } from '../../services/photos.service';
import { LanguageService } from '../../services/language.service';
import { CartService } from '../../services/cart.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;
  let photosService: PhotosService;
  let languageService: LanguageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        LanguageService,
        provideRouter([
          { path: '', component: class {} },
          { path: 'photography', component: class {} },
          { path: 'web_development', component: class {} },
          { path: 'shop', component: class {} },
          { path: 'shop/cart', component: class {} }
        ])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    photosService = TestBed.inject(PhotosService);
    languageService = TestBed.inject(LanguageService);
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show Photography or Web development in nav on home route (/)', async () => {
    await router.navigateByUrl('/');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const desktopLinks = Array.from(el.querySelectorAll('.nav-links .nav-item')).map(a => a.textContent?.trim());
    expect(desktopLinks).toContain('About');
    expect(desktopLinks).toContain('Instagram');
    expect(desktopLinks).not.toContain('Photography');
    expect(desktopLinks).not.toContain('Web development');
  });

  it('should show Web development and NOT Photography on /photography route', async () => {
    await router.navigateByUrl('/photography');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const desktopLinks = Array.from(el.querySelectorAll('.nav-links .nav-item')).map(a => a.textContent?.trim());
    expect(desktopLinks).toContain('About');
    expect(desktopLinks).toContain('Instagram');
    expect(desktopLinks).not.toContain('Photography');
    expect(desktopLinks).toContain('Web development');

    // Check order: About -> Shop -> Instagram -> Web development
    expect(desktopLinks).toEqual(['About', 'Shop', 'Instagram', 'Web development']);
  });

  it('should show Photography and NOT Web development on /web_development route', async () => {
    await router.navigateByUrl('/web_development');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const desktopLinks = Array.from(el.querySelectorAll('.nav-links .nav-item')).map(a => a.textContent?.trim());
    expect(desktopLinks).toContain('About');
    expect(desktopLinks).toContain('Instagram');
    expect(desktopLinks).toContain('Photography');
    expect(desktopLinks).not.toContain('Web development');

    // Check order: About -> Shop -> Instagram -> Photography
    expect(desktopLinks).toEqual(['About', 'Shop', 'Instagram', 'Photography']);
  });

  it('should toggle mobile menu drawer and display appropriate route links', async () => {
    await router.navigateByUrl('/web_development');
    fixture.detectChanges();

    component.toggleMobileMenu();
    fixture.detectChanges();

    expect(component.isMobileMenuOpen()).toBe(true);
    expect(photosService.isMobileMenuOpen()).toBe(true);

    const el = fixture.nativeElement as HTMLElement;
    const header = el.querySelector('header');
    expect(header?.classList.contains('menu-open')).toBe(true);

    const brandTitle = el.querySelector('.header-container .brand-title');
    expect(brandTitle?.textContent?.trim()).toBe('HuuTai Tran');

    const drawerLinks = Array.from(el.querySelectorAll('.drawer-links .drawer-item')).map(a => a.textContent?.trim());
    expect(drawerLinks).toContain('About');
    expect(drawerLinks).toContain('Instagram');
    expect(drawerLinks).toContain('Photography');
    expect(drawerLinks).not.toContain('Web development');
    expect(document.body.style.overflow).toBe('hidden');

    component.closeMobileMenu();
    fixture.detectChanges();
    expect(component.isMobileMenuOpen()).toBe(false);
    expect(photosService.isMobileMenuOpen()).toBe(false);
    expect(header?.classList.contains('menu-open')).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('should call photosService.openAbout when About is clicked', () => {
    const openAboutSpy = vi.spyOn(photosService, 'openAbout');
    component.openAbout();
    expect(openAboutSpy).toHaveBeenCalled();
  });

  it('should open About before closing the mobile menu without unlocking scroll', () => {
    component.toggleMobileMenu();
    const closeMenuSpy = vi.spyOn(component, 'closeMobileMenu').mockImplementation(() => {
      expect(photosService.isAboutOpen()).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');
    });

    component.openAbout();
    expect(closeMenuSpy).toHaveBeenCalled();
    closeMenuSpy.mockRestore();
    component.closeMobileMenu();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.touchAction).toBe('none');
    photosService.closeAbout();
  });

  it('should display FR | EN language switch with EN active by default', () => {
    const el = fixture.nativeElement as HTMLElement;
    const langSelector = el.querySelector('.nav-links .lang-selector');
    expect(langSelector).toBeTruthy();

    const buttons = el.querySelectorAll('.nav-links .lang-btn');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent?.trim()).toBe('FR');
    expect(buttons[1].textContent?.trim()).toBe('EN');

    expect(buttons[0].classList.contains('active')).toBe(false);
    expect(buttons[1].classList.contains('active')).toBe(true);
    expect(component.currentLang()).toBe('EN');
  });

  it('should switch active language to FR when FR button is clicked and translate nav links', async () => {
    await router.navigateByUrl('/photography');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const frButton = el.querySelector('.nav-links .lang-btn:first-child') as HTMLButtonElement;
    frButton.click();
    fixture.detectChanges();

    expect(component.currentLang()).toBe('FR');
    const buttons = el.querySelectorAll('.nav-links .lang-btn');
    expect(buttons[0].classList.contains('active')).toBe(true);
    expect(buttons[1].classList.contains('active')).toBe(false);

    const desktopLinks = Array.from(el.querySelectorAll('.nav-links .nav-item')).map(a => a.textContent?.trim());
    expect(desktopLinks).toEqual(['À propos', 'Shop', 'Instagram', 'Développement web']);
  });

  it('should show Shop link left of Instagram in the mobile drawer', () => {
    component.toggleMobileMenu();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const drawerLinks = Array.from(el.querySelectorAll('.drawer-links .drawer-item')).map(a => a.textContent?.trim());
    expect(drawerLinks.indexOf('Shop')).toBe(drawerLinks.indexOf('Instagram') - 1);
    component.closeMobileMenu();
  });

  it('should show the cart icon with the item count only when the cart is not empty', () => {
    const cart = TestBed.inject(CartService);
    const el = fixture.nativeElement as HTMLElement;
    cart.clear();
    fixture.detectChanges();
    expect(el.querySelector('.cart-link')).toBeNull();

    cart.add({ productId: 'frame_1', dimension: '10 × 15 cm', withFrame: false, frameColor: null });
    cart.add({ productId: 'frame_2', dimension: '20 × 30 cm', withFrame: true, frameColor: 'black' });
    fixture.detectChanges();

    const link = el.querySelector('.cart-link') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/shop/cart');
    expect(link.querySelector('.cart-badge')?.textContent?.trim()).toBe('2');
    cart.clear();
  });
});
