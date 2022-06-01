import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaAdminPageComponent } from './media-admin-page.component';

describe('MediaAdminPageComponent', () => {
  let component: MediaAdminPageComponent;
  let fixture: ComponentFixture<MediaAdminPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaAdminPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaAdminPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
