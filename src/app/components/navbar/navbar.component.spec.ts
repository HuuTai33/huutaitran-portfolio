import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavbarComponent } from './navbar.component';
import { PhotosService } from '../../services/photos.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;
  let photosService: PhotosService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([
          { path: '', component: class {} },
          { path: 'photography', component: class {} },
          { path: 'web_development', component: class {} }
        ])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    photosService = TestBed.inject(PhotosService);
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

    // Check order: About -> Instagram -> Web development
    expect(desktopLinks).toEqual(['About', 'Instagram', 'Web development']);
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

    // Check order: About -> Instagram -> Photography
    expect(desktopLinks).toEqual(['About', 'Instagram', 'Photography']);
  });

  it('should toggle mobile menu drawer and display appropriate route links', async () => {
    await router.navigateByUrl('/web_development');
    fixture.detectChanges();

    component.toggleMobileMenu();
    fixture.detectChanges();

    expect(component.isMobileMenuOpen()).toBe(true);

    const el = fixture.nativeElement as HTMLElement;
    const drawerLinks = Array.from(el.querySelectorAll('.drawer-links .drawer-item')).map(a => a.textContent?.trim());
    expect(drawerLinks).toContain('About');
    expect(drawerLinks).toContain('Instagram');
    expect(drawerLinks).toContain('Photography');
    expect(drawerLinks).not.toContain('Web development');
  });

  it('should call photosService.openAbout when About is clicked', () => {
    const openAboutSpy = vi.spyOn(photosService, 'openAbout');
    component.openAbout();
    expect(openAboutSpy).toHaveBeenCalled();
  });
});
