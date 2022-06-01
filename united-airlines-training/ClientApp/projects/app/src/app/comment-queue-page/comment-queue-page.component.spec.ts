import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentQueuePageComponent } from './comment-queue-page.component';

describe('CommentQueuePageComponent', () => {
  let component: CommentQueuePageComponent;
  let fixture: ComponentFixture<CommentQueuePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentQueuePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentQueuePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
