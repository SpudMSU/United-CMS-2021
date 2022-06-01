import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaPopUpComponent } from './media-pop-up.component';

describe('MediaPopUpComponent', () => {
  let component: MediaPopUpComponent;
  let fixture: ComponentFixture<MediaPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaPopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
