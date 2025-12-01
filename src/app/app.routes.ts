import { Routes } from '@angular/router';
import { LoginComponent } from "./pages/public/login/login.component";
import { EventsComponent } from "./pages/shiftcontrol/events/events.component";
import { ShiftsComponent } from "./pages/shiftcontrol/shifts/shifts.component";
import {BC_EVENTS, BC_SHIFTS, BC_ACCOUNT, Breadcrumb, BC_HOME} from "./breadcrumbs";
import { breadcrumbsGuard } from "./guards/breadcrumbs/breadcrumbs.guard";
import {keycloakGuard} from "./guards/keycloak/keycloak.guard";
import {AccountComponent} from "./pages/shiftcontrol/account/account.component";
import {HomeComponent} from "./pages/shiftcontrol/home/home.component";

export const routes: Routes = ([
  { path: "", component: HomeComponent, pathMatch: "full", data: {breadcrumbs: BC_HOME}, canActivate: [keycloakGuard] },
  { path: "login", component: LoginComponent },
  { path: "me", component: AccountComponent, data: {breadcrumbs: BC_ACCOUNT}, canActivate: [keycloakGuard]},
  { path: "events", component: EventsComponent, data: {breadcrumbs: BC_EVENTS}, canActivate: [keycloakGuard]},
  { path: "events/:eventId", component: ShiftsComponent, data: {breadcrumbs: BC_SHIFTS}, canActivate: [keycloakGuard]}

  /* add breadcrumbs guard to each route definition*/
] as Routes).map(
  route => route.redirectTo ? route : ({...route, canActivate: [...(route.canActivate ?? []), breadcrumbsGuard]})
);
