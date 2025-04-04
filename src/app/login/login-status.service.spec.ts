import { TestBed } from '@angular/core/testing';

import { LoginStatusService } from './login-status.service';

describe('LoginStatusService', () => {
  let service: LoginStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
