import { TestBed } from '@angular/core/testing';

import { ChangedUserService } from './changed-user.service';

describe('ChangedUserService', () => {
  let service: ChangedUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangedUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
