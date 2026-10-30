import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoaderComponent } from './loader.component';
import { PhotosService } from '../../services/photos.service';

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderComponent],
      providers: [PhotosService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the loader component', () => {
    expect(component).toBeTruthy();
  });

  it('should render brackets and dots animation', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loader-brackets')).toBeTruthy();
    expect(compiled.querySelectorAll('.dot').length).toBe(3);
  });
});
