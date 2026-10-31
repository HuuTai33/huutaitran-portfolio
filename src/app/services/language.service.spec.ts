import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default language EN', () => {
    expect(service.currentLang()).toBe('EN');
  });

  it('should allow changing language to FR and back to EN and update translations', () => {
    expect(service.t().nav.about).toBe('About');
    expect(service.t().about.roleTitle).toBe('Web developer / Photographer');
    expect(service.t().webDev.title).toBe('Work listing');

    service.setLanguage('FR');
    expect(service.currentLang()).toBe('FR');
    expect(service.t().nav.about).toBe('À propos');
    expect(service.t().about.roleTitle).toBe('Développeur web / Photographe');
    expect(service.t().webDev.title).toBe('Réalisations');

    service.setLanguage('EN');
    expect(service.currentLang()).toBe('EN');
    expect(service.t().nav.about).toBe('About');
  });
});
