import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LightboxComponent } from './lightbox.component';
import { PhotosService } from '../../services/photos.service';
import { LanguageService } from '../../services/language.service';
import { beforeEach, describe, expect, it } from 'vitest';

describe('LightboxComponent', () => {
  let component: LightboxComponent;
  let fixture: ComponentFixture<LightboxComponent>;
  let photosService: PhotosService;
  let languageService: LanguageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightboxComponent],
      providers: [PhotosService, LanguageService]
    }).compileComponents();

    fixture = TestBed.createComponent(LightboxComponent);
    component = fixture.componentInstance;
    photosService = TestBed.inject(PhotosService);
    languageService = TestBed.inject(LanguageService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display lightbox when closed', () => {
    const backdrop = fixture.nativeElement.querySelector('.lightbox-backdrop');
    expect(backdrop).toBeNull();
  });

  it('should display centered photo, inquiry text and contact button when open', () => {
    const photo = photosService.photos()[0];
    photosService.openLightbox(photo);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.lightbox-backdrop');
    const img = fixture.nativeElement.querySelector('.lightbox-photo-img') as HTMLImageElement;
    const closeBtn = fixture.nativeElement.querySelector('.lightbox-close-btn');
    const inquiryText = fixture.nativeElement.querySelector('.lightbox-inquiry-text');
    const contactBtn = fixture.nativeElement.querySelector('.btn-direct-contact') as HTMLAnchorElement;

    expect(backdrop).toBeTruthy();
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe(photo);
    expect(closeBtn).toBeTruthy();
    expect(inquiryText).toBeTruthy();
    expect(contactBtn).toBeTruthy();
    expect(contactBtn.getAttribute('href')).toBe('mailto:huutai.tran33@gmail.com');
  });

  it('should update inquiry text and contact button when changing language to FR', () => {
    const photo = photosService.photos()[0];
    photosService.openLightbox(photo);
    languageService.setLanguage('FR');
    fixture.detectChanges();

    const inquiryText = fixture.nativeElement.querySelector('.lightbox-inquiry-text');
    const contactBtn = fixture.nativeElement.querySelector('.btn-direct-contact');

    expect(inquiryText.textContent).toContain('Vous souhaitez un tirage de cette photo ?');
    expect(contactBtn.textContent).toContain('Me contacter');
  });

  it('should close lightbox when clicking close button or backdrop', () => {
    const photo = photosService.photos()[0];
    photosService.openLightbox(photo);
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.lightbox-close-btn') as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(photosService.isLightboxOpen()).toBe(false);
  });
});
