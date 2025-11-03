import { TestBed } from '@angular/core/testing';

import { HrkApiService } from './hrk-api.service';

describe('HrkApi', () => {
  let service: HrkApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HrkApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
