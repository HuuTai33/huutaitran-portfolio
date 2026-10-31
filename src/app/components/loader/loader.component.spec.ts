import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoaderComponent } from './loader.component';
import { PhotosService } from '../../services/photos.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [LoaderComponent],
      providers: [PhotosService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the loader component', () => {
    expect(component).toBeTruthy();
  });

  it('should render brackets and dots animation', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loader-brackets')).toBeTruthy();
    expect(compiled.querySelectorAll('.dot').length).toBe(3);
  });

  it('should complete and fade out after 2000ms when images load immediately', async () => {
    // Mock global Image to resolve onload immediately
    const originalImage = globalThis.Image;
    globalThis.Image = class extends originalImage {
      constructor() {
        super();
        setTimeout(() => {
          this.onload?.(new Event('load'));
        }, 10);
      }
    } as unknown as typeof Image;

    try {
      const testFixture = TestBed.createComponent(LoaderComponent);
      const testComp = testFixture.componentInstance;
      const completedSpy = vi.fn();
      testComp.completed.subscribe(completedSpy);
      testFixture.detectChanges();

      // Before 2000ms, should not be fading out
      await vi.advanceTimersByTimeAsync(1500);
      expect(testComp.isFadingOut()).toBe(false);

      // At 2000ms (minDelayMs), should start fading out
      await vi.advanceTimersByTimeAsync(500);
      await vi.advanceTimersByTimeAsync(50);
      expect(testComp.isFadingOut()).toBe(true);
      expect(testComp.isHidden()).toBe(false);

      // After 600ms transition, should be hidden and emit completed
      await vi.advanceTimersByTimeAsync(600);
      expect(testComp.isHidden()).toBe(true);
      expect(completedSpy).toHaveBeenCalled();
    } finally {
      globalThis.Image = originalImage;
    }
  });
});
