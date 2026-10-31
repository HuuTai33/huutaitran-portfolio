import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebDevelopmentComponent } from './web-development.component';

describe('WebDevelopmentComponent', () => {
  let component: WebDevelopmentComponent;
  let fixture: ComponentFixture<WebDevelopmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebDevelopmentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WebDevelopmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render loader component', () => {
    const el = fixture.nativeElement as HTMLElement;
    const loader = el.querySelector('app-loader');
    expect(loader).toBeTruthy();
  });

  it('should display "Work listing" header', () => {
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('.web-dev-title');
    expect(title).toBeTruthy();
    expect(title?.textContent?.trim()).toBe('Work listing');
  });

  it('should render project card for Marina J Photographie with link and image', () => {
    const el = fixture.nativeElement as HTMLElement;
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
