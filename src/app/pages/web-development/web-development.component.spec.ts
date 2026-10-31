import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebDevelopmentComponent, WebProject } from './web-development.component';
import { LanguageService } from '../../services/language.service';
import { PhotosService } from '../../services/photos.service';

describe('WebDevelopmentComponent', () => {
  let component: WebDevelopmentComponent;
  let fixture: ComponentFixture<WebDevelopmentComponent>;
  let languageService: LanguageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebDevelopmentComponent],
      providers: [LanguageService]
    }).compileComponents();

    fixture = TestBed.createComponent(WebDevelopmentComponent);
    component = fixture.componentInstance;
    languageService = TestBed.inject(LanguageService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.each(['mobile menu', 'About'])('should freeze the background and discard inertia while %s is open', overlay => {
    fixture.destroy();
    const frames: FrameRequestCallback[] = [];
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      frames.push(callback);
      return frames.length;
    });
    try {
      fixture = TestBed.createComponent(WebDevelopmentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      const photosService = TestBed.inject(PhotosService);
      const track = component.trackRef!.nativeElement;
      frames.shift()!(16);
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
      frames.shift()!(32);
      const position = track.style.transform;

      if (overlay === 'About') {
        photosService.openAbout();
      } else {
        photosService.isMobileMenuOpen.set(true);
      }
      frames.shift()!(48);
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
      component.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      const touch = new TouchEvent('touchmove');
      Object.defineProperty(touch, 'touches', { value: [{ clientX: 200 }] });
      component.onTouchStart(touch);
      component.onTouchMove(touch);
      component.onTouchEnd();
      component.onPointerDown(new MouseEvent('mousedown', { clientX: 200 }));
      component.onPointerMove(new MouseEvent('mousemove', { clientX: 100 }));
      component.onPointerUp();
      expect(track.style.transform).toBe(position);
      expect(frames).toHaveLength(0);
      expect(component.isDragging()).toBe(false);

      if (overlay === 'About') {
        photosService.closeAbout();
      } else {
        photosService.isMobileMenuOpen.set(false);
      }
      expect(frames).toHaveLength(0);
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
      frames.shift()!(64);
      expect(track.style.transform).not.toBe(position);
    } finally {
      TestBed.inject(PhotosService).closeAbout();
      TestBed.inject(PhotosService).isMobileMenuOpen.set(false);
      raf.mockRestore();
    }
  });

  it('should render loader component', () => {
    const el = fixture.nativeElement as HTMLElement;
    const loader = el.querySelector('app-loader');
    expect(loader).toBeTruthy();
  });

  it('should display "Work listing" header in EN and "Réalisations" in FR', () => {
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('.web-dev-title');
    expect(title).toBeTruthy();
    expect(title?.textContent?.trim()).toBe('Work listing');

    languageService.setLanguage('FR');
    fixture.detectChanges();
    expect(title?.textContent?.trim()).toBe('Réalisations');
  });

  it('should render project card for Marina J Photographie with link and image in single project view', () => {
    component.projects.set([
      {
        title: 'Marina J Photographie',
        image: '/images/work_dev/converted_webp/marinajphotographie.webp',
        url: 'https://www.marinajphotographie.fr/',
      }
    ]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const singleView = el.querySelector('.projects-single-view');
    expect(singleView).toBeTruthy();

    const projectCard = el.querySelector('.project-card');
    expect(projectCard).toBeTruthy();

    const link = el.querySelector('.project-link') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://www.marinajphotographie.fr/');
    expect(link.getAttribute('target')).toBe('_blank');

    const image = el.querySelector('.project-image') as HTMLImageElement;
    expect(image).toBeTruthy();
    expect(image.getAttribute('src')).toBe('/images/work_dev/converted_webp/marinajphotographie.webp');
    expect(image.getAttribute('alt')).toContain('Marina J Photographie');

    const projectTitle = el.querySelector('.project-title');
    expect(projectTitle?.textContent?.trim()).toBe('Marina J Photographie');
  });

  it('should render horizontal infinite loop stream when there are multiple projects', () => {
    const multiProjects: WebProject[] = [
      {
        title: 'Project 1',
        image: '/images/work_dev/converted_webp/p1.webp',
        url: 'https://p1.com/'
      },
      {
        title: 'Project 2',
        image: '/images/work_dev/converted_webp/p2.webp',
        url: 'https://p2.com/'
      }
    ];

    component.projects.set(multiProjects);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const streamViewport = el.querySelector('.projects-stream-viewport');
    expect(streamViewport).toBeTruthy();

    const sets = el.querySelectorAll('.projects-loop-set');
    expect(sets.length).toBeGreaterThanOrEqual(2);

    const projectTitles = el.querySelectorAll('.project-title');
    expect(projectTitles.length).toBeGreaterThanOrEqual(4); // 2 projects * sets
  });

  it('should handle pointer drag and keyboard navigation when multiple projects exist', () => {
    const multiProjects: WebProject[] = [
      { title: 'Project 1', image: '/img1.webp', url: 'https://p1.com/' },
      { title: 'Project 2', image: '/img2.webp', url: 'https://p2.com/' }
    ];
    component.projects.set(multiProjects);
    fixture.detectChanges();

    // Mouse drag interactions
    component.onPointerDown(new MouseEvent('mousedown', { button: 0, clientX: 200 }));
    expect(component.isDragging()).toBe(false);

    component.onPointerMove(new MouseEvent('mousemove', { clientX: 180 }));
    expect(component.isDragging()).toBe(true);

    const preventDefaultSpy = vi.fn();
    const stopPropagationSpy = vi.fn();
    component.onLinkClick({
      preventDefault: preventDefaultSpy,
      stopPropagation: stopPropagationSpy
    } as unknown as MouseEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();

    component.onPointerUp();

    // Keyboard navigation
    const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    vi.spyOn(arrowRightEvent, 'preventDefault');
    component.onKeyDown(arrowRightEvent);
    expect(arrowRightEvent.preventDefault).toHaveBeenCalled();

    const arrowLeftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    vi.spyOn(arrowLeftEvent, 'preventDefault');
    component.onKeyDown(arrowLeftEvent);
    expect(arrowLeftEvent.preventDefault).toHaveBeenCalled();

    const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
    vi.spyOn(homeEvent, 'preventDefault');
    component.onKeyDown(homeEvent);
    expect(homeEvent.preventDefault).toHaveBeenCalled();
  });

  it('should handle touch drag and momentum when multiple projects exist', () => {
    const multiProjects: WebProject[] = [
      { title: 'Project 1', image: '/img1.webp', url: 'https://p1.com/' },
      { title: 'Project 2', image: '/img2.webp', url: 'https://p2.com/' }
    ];
    component.projects.set(multiProjects);
    fixture.detectChanges();

    // Touch start
    component.onTouchStart({
      touches: [{ clientX: 200 }]
    } as unknown as TouchEvent);
    expect(component.isDragging()).toBe(false);

    // Touch move past threshold
    component.onTouchMove({
      touches: [{ clientX: 180 }]
    } as unknown as TouchEvent);
    expect(component.isDragging()).toBe(true);

    // Touch end
    component.onTouchEnd();
  });

  it('should render floating footer hud with email and copyright', () => {
    const el = fixture.nativeElement as HTMLElement;
    const footer = el.querySelector('.stream-floating-hud');
    expect(footer).toBeTruthy();

    const email = el.querySelector('.hud-email');
    expect(email?.textContent).toContain('EMAIL : huutai.tran33@gmail.com');
    expect(email?.getAttribute('href')).toBe('mailto:huutai.tran33@gmail.com');

    const year = el.querySelector('.hud-year');
    expect(year?.textContent).toContain('©2026');
  });
});
