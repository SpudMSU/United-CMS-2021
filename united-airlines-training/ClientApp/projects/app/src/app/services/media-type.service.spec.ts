import { TestBed } from '@angular/core/testing';

import { MediaTypeService } from './media-type.service';

describe('MediaTypeService', () => {
  let service: MediaTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
