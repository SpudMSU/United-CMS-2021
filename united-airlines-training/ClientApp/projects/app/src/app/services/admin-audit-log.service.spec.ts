import { TestBed } from '@angular/core/testing';

import { AdminAuditLogService } from './admin-audit-log.service';

describe('AdminAuditLogService', () => {
  let service: AdminAuditLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminAuditLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
