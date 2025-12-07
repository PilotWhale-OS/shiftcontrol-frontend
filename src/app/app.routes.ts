import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/public/login/login.component";
import { EventsComponent } from "./pages/shiftcontrol/events/events.component";
import { ShiftsComponent } from "./pages/shiftcontrol/shifts/shifts.component";
import {
  BC_EVENTS,
  BC_SHIFTS,
  BC_ACCOUNT,
  BC_HOME,
  BC_SHIFT_DASHBOARD,
  BC_SHIFT_CALENDAR,
  BC_SHIFT_DETAILS,
  BC_PLAN_ONBOARDING
} from "./breadcrumbs";
import { breadcrumbsGuard } from "./guards/breadcrumbs/breadcrumbs.guard";
import {keycloakGuard} from "./guards/keycloak/keycloak.guard";
import {AccountComponent} from "./pages/shiftcontrol/account/account.component";
import {HomeComponent} from "./pages/shiftcontrol/home/home.component";
import {ShiftPlanDashboardComponent} from "./pages/shiftcontrol/shift-dashboard/shift-plan-dashboard.component";
import {ShiftCalendarComponent} from "./pages/shiftcontrol/shift-calendar/shift-calendar.component";
import {ShiftDetailsComponent} from "./pages/shiftcontrol/shift-details/shift-details.component";
import {PlanOnboardingComponent} from "./pages/shiftcontrol/plan-onboarding/plan-onboarding.component";

export const routes: Routes = ([
  { path: "", component: HomeComponent, pathMatch: "full", data: {breadcrumbs: BC_HOME}, canActivate: [keycloakGuard] },
  { path: "login", component: LoginComponent },
  { path: "me", component: AccountComponent,
    data: {breadcrumbs: BC_ACCOUNT}, canActivate: [keycloakGuard]},
  { path: "events", component: EventsComponent,
    data: {breadcrumbs: BC_EVENTS}, canActivate: [keycloakGuard]},
  { path: "events/:eventId", component: ShiftsComponent,
    data: {breadcrumbs: BC_SHIFTS}, canActivate: [keycloakGuard]},
  { path: "events/:eventId/:shiftId", component: ShiftPlanDashboardComponent,
    data: { breadcrumbs: BC_SHIFT_DASHBOARD }, canActivate: [keycloakGuard]},
  { path: "events/:eventId/:shiftPlanId/calendar", component: ShiftCalendarComponent,
    data: { breadcrumbs: BC_SHIFT_CALENDAR }, canActivate: [keycloakGuard]},
  { path: "events/:eventId/:shiftPlanId/onboarding", component: PlanOnboardingComponent,
    data: { breadcrumbs: BC_PLAN_ONBOARDING }, canActivate: [keycloakGuard]},
  { path: "events/:eventId/:shiftPlanId/:shiftId", component: ShiftDetailsComponent,
    data: { breadcrumbs: BC_SHIFT_DETAILS }, canActivate: [keycloakGuard]}

  /* add breadcrumbs guard to each route definition*/
] as Routes).map(
  route => route.redirectTo ? route : ({...route, canActivate: [...(route.canActivate ?? []), breadcrumbsGuard]})
);
