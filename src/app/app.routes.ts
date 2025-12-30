import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/public/login/login.component";
import { EventsComponent } from "./pages/shiftcontrol/events/events.component";
import { EventComponent } from "./pages/shiftcontrol/shifts/event.component";
import {
  BC_EVENTS,
  BC_EVENT,
  BC_ACCOUNT,
  BC_HOME,
  BC_PLAN_DASHBOARD,
  BC_SHIFT_CALENDAR,
  BC_SHIFT_DETAILS,
  BC_PLAN_ONBOARDING
} from "./breadcrumbs";
import { breadcrumbsGuard } from "./guards/breadcrumbs/breadcrumbs.guard";
import {accessAllowedGuard, notLoggedInGuard} from "./guards/keycloak/keycloak.guard";
import {AccountComponent} from "./pages/shiftcontrol/account/account.component";
import {HomeComponent} from "./pages/shiftcontrol/home/home.component";
import {ShiftPlanDashboardComponent} from "./pages/shiftcontrol/shift-plan-dashboard/shift-plan-dashboard.component";
import {ShiftCalendarComponent} from "./pages/shiftcontrol/shift-calendar/shift-calendar.component";
import {ShiftDetailsComponent} from "./pages/shiftcontrol/shift-details/shift-details.component";
import {PlanOnboardingComponent} from "./pages/shiftcontrol/plan-onboarding/plan-onboarding.component";

export const routes: Routes = ([
  { path: "", component: HomeComponent, pathMatch: "full", data: {breadcrumbs: BC_HOME}, canActivate: [accessAllowedGuard] },
  { path: "login", component: LoginComponent, canActivate: [notLoggedInGuard] },
  { path: "me", component: AccountComponent,
    data: {breadcrumbs: BC_ACCOUNT}, canActivate: [accessAllowedGuard]},
  { path: "events", component: EventsComponent,
    data: {breadcrumbs: BC_EVENTS}, canActivate: [accessAllowedGuard]},
  { path: "events/:eventId", component: EventComponent,
    data: {breadcrumbs: BC_EVENT}, canActivate: [accessAllowedGuard]},
  { path: "plans/:shiftPlanId", component: ShiftPlanDashboardComponent,
    data: { breadcrumbs: BC_PLAN_DASHBOARD }, canActivate: [accessAllowedGuard]},
  { path: "plans/:shiftPlanId/calendar", component: ShiftCalendarComponent,
    data: { breadcrumbs: BC_SHIFT_CALENDAR }, canActivate: [accessAllowedGuard]},
  { path: "join/:shiftPlanInvite", redirectTo: "onboarding/:shiftPlanInvite", pathMatch: "full" },
  { path: "onboarding/:shiftPlanInvite", component: PlanOnboardingComponent,
    data: { breadcrumbs: BC_PLAN_ONBOARDING }, canActivate: [accessAllowedGuard]},
  { path: "shifts/:shiftId", component: ShiftDetailsComponent,
    data: { breadcrumbs: BC_SHIFT_DETAILS }, canActivate: [accessAllowedGuard]}

  /* add breadcrumbs guard to each route definition*/
] as Routes).map(
  route => route.redirectTo ? route : ({...route, canActivate: [...(route.canActivate ?? []), breadcrumbsGuard]})
);
