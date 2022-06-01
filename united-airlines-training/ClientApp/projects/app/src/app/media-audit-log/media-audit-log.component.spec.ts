import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaAuditLogComponent } from './media-audit-log.component';

describe('MediaAuditLogComponent', () => {
  let component: MediaAuditLogComponent;
  let fixture: ComponentFixture<MediaAuditLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaAuditLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaAuditLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
