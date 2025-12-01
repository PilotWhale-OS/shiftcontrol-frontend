import { CanActivateFn } from '@angular/router';
import {Breadcrumb} from '../../breadcrumbs';
import {inject} from '@angular/core';
import {PageService} from '../../services/breadcrumbs/page.service';

export const breadcrumbsGuard: CanActivateFn = (route) => {

  /* set breadcrumbs only for leaf routes */
  if(route.children.length > 0) return true;

  const pageService = inject(PageService);

  /* get breadcrumbs of route data */
  const routeData = route.data;
  const breadcrumbs = routeData['breadcrumbs'];

  /* if found, set as current breadcrumbs */
  if(breadcrumbs instanceof Breadcrumb) {
    pageService.withBreadcrumbs(breadcrumbs);
  }
  else {
    pageService.withBreadcrumbs(undefined);
  }

  return true;
};
