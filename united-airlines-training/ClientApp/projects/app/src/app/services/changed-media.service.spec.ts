import { TestBed } from '@angular/core/testing';

import { ChangedMediaService } from './changed-media.service';

describe('ChangedMediaService', () => {
  let service: ChangedMediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangedMediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
