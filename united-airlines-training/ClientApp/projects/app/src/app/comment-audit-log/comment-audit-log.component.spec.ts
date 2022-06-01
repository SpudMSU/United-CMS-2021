import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentAuditLogComponent } from './comment-audit-log.component';

describe('CommentAuditLogComponent', () => {
  let component: CommentAuditLogComponent;
  let fixture: ComponentFixture<CommentAuditLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentAuditLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentAuditLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
