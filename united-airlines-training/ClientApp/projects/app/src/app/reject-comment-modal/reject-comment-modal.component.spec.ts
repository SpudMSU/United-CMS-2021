import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectCommentModalComponent } from './reject-comment-modal.component';

describe('RejectCommentModalComponent', () => {
  let component: RejectCommentModalComponent;
  let fixture: ComponentFixture<RejectCommentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectCommentModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectCommentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
