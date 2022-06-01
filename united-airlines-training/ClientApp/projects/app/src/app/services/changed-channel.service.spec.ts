import { TestBed } from '@angular/core/testing';

import { ChangedChannelService } from './changed-channel.service';

describe('ChangedChannelService', () => {
  let service: ChangedChannelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangedChannelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
