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
});
