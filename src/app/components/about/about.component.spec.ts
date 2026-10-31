import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutComponent } from './about.component';
import { PhotosService } from '../../services/photos.service';
import { LanguageService } from '../../services/language.service';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;
  let photosService: PhotosService;
  let languageService: LanguageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [PhotosService, LanguageService]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    photosService = TestBed.inject(PhotosService);
    languageService = TestBed.inject(LanguageService);
    fixture.detectChanges();
  });

  it('should create the about component', () => {
    expect(component).toBeTruthy();
  });

  it('should render artist name and contact button when open', () => {
    photosService.openAbout();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const nameEl = compiled.querySelector('.artist-name');
    expect(nameEl?.textContent).toContain('Web developer / Photographer');

    const bioEl = compiled.querySelector('.about-bio');
    expect(bioEl?.textContent).toContain('Full Stack Web Developer');
    expect(bioEl?.textContent).toContain('street photography');

    const contactBtn = compiled.querySelector('.btn-direct-contact') as HTMLAnchorElement;
    expect(contactBtn).toBeTruthy();
    expect(contactBtn.textContent).toContain('Get in touch');
    expect(contactBtn.getAttribute('href')).toBe('mailto:huutai.tran33@gmail.com');
  });

  it('should translate about content when language changes to FR', () => {
    languageService.setLanguage('FR');
    photosService.openAbout();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const nameEl = compiled.querySelector('.artist-name');
    expect(nameEl?.textContent).toContain('Développeur web / Photographe');

    const bioEl = compiled.querySelector('.about-bio');
    expect(bioEl?.textContent).toContain('Développeur Web Full Stack');
    expect(bioEl?.textContent).toContain('photographie de rue');

    const contactBtn = compiled.querySelector('.btn-direct-contact') as HTMLAnchorElement;
    expect(contactBtn.textContent).toContain('Me contacter');
  });

  it('should close when close button is clicked', () => {
    photosService.openAbout();
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.about-close-btn') as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(photosService.isAboutOpen()).toBe(false);
  });
});
