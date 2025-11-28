import { Routes } from '@angular/router';
import { LoginComponent } from "./pages/public/login/login.component";
import { EventsComponent } from "./pages/shiftcontrol/events/events.component";
import { ShiftsComponent } from "./pages/shiftcontrol/shifts/shifts.component";
import { BC_EVENTS, BC_SHIFTS } from "./breadcrumbs";
import { breadcrumbsGuard } from "./guards/breadcrumbs/breadcrumbs.guard";

export const routes: Routes = ([
  { path: "login", component: LoginComponent },
  { path: "events", component: EventsComponent, data: {breadcrumbs: BC_EVENTS}},
  { path: "events/:eventId", component: ShiftsComponent, data: {breadcrumbs: BC_SHIFTS}}

  /* add breadcrumbs guard to each route definition*/
] as Routes).map(
  route => ({...route, canActivate: [...(route.canActivate ?? []), breadcrumbsGuard]})
);
