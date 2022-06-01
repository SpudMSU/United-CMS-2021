import { TestBed } from '@angular/core/testing';

import { ChangedCommentService } from './changed-comment.service';

describe('ChangedCommentService', () => {
  let service: ChangedCommentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangedCommentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
