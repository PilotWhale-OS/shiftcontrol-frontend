import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { breadcrumbsGuard } from './breadcrumbs.guard';

describe('breadcrumbsGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => breadcrumbsGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
