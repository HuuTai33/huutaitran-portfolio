import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotographyComponent } from './photography.component';
import { PhotosService } from '../../services/photos.service';

describe('PhotographyComponent', () => {
  let component: PhotographyComponent;
  let fixture: ComponentFixture<PhotographyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotographyComponent],
      providers: [PhotosService]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotographyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render gallery and loader', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-gallery')).toBeTruthy();
    expect(el.querySelector('app-loader')).toBeTruthy();
    expect(el.querySelector('app-lightbox')).toBeTruthy();
  });
});
