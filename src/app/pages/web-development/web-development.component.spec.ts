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

  it('should display centered "Web development" text', () => {
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('.web-dev-title');
    expect(title).toBeTruthy();
    expect(title?.textContent?.trim()).toBe('Web development');
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
