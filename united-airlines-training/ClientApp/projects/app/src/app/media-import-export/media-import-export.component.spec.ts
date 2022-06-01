import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaImportExportComponent } from './media-import-export.component';

describe('MediaImportExportComponent', () => {
  let component: MediaImportExportComponent;
  let fixture: ComponentFixture<MediaImportExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaImportExportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaImportExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
