import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAuditLogComponent } from './admin-audit-log.component';

describe('AdminAuditLogComponent', () => {
  let component: AdminAuditLogComponent;
  let fixture: ComponentFixture<AdminAuditLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAuditLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAuditLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
