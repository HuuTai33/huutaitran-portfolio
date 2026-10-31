import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render navigation links for photography and web development', () => {
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('a.portal-link');
    expect(links.length).toBe(2);

    expect(links[0].textContent?.trim()).toBe('Photography');
    expect(links[0].getAttribute('href')).toBe('/photography');

    expect(links[1].textContent?.trim()).toBe('Web development');
    expect(links[1].getAttribute('href')).toBe('/web_development');
  });

  it('should render separator between links', () => {
    const el = fixture.nativeElement as HTMLElement;
    const divider = el.querySelector('.portal-divider');
    expect(divider).toBeTruthy();
    expect(divider?.textContent?.trim()).toBe('|');
  });
});
