import { TestBed } from '@angular/core/testing';

import { DadyinUsersService } from './dadyin-users.service';

describe('DadyinUsersService', () => {
  let service: DadyinUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DadyinUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
