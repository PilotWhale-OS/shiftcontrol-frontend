import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/public/login/login.component";
import { EventsComponent } from "./pages/shiftcontrol/events/events.component";
import { EventComponent } from "./pages/shiftcontrol/event/event.component";
import {
  BC_EVENTS,
  BC_EVENT,
  BC_ACCOUNT,
  BC_HOME,
  BC_PLAN_DASHBOARD,
  BC_SHIFT_CALENDAR,
  BC_SHIFT_DETAILS,
  BC_PLAN_ONBOARDING, BC_EVENT_EDIT, BC_EVENT_CREATE, BC_EVENT_SCHEDULE, BC_NOTIFICATIONS,
  BC_PLAN_SIGNUP_DASHBOARD, BC_EVENT_PLANS
} from "./breadcrumbs";
import { breadcrumbsGuard } from "./guards/breadcrumbs/breadcrumbs.guard";
import {accessAllowedGuard, notLoggedInGuard} from "./guards/keycloak/keycloak.guard";
import {AccountComponent} from "./pages/shiftcontrol/account/account.component";
import {HomeComponent} from "./pages/shiftcontrol/home/home.component";
import {ShiftPlanComponent} from "./pages/shiftcontrol/shift-plan/shift-plan.component";
import {ShiftCalendarComponent} from "./pages/shiftcontrol/shift-calendar/shift-calendar.component";
import {ShiftDetailsComponent} from "./pages/shiftcontrol/shift-details/shift-details.component";
import {PlanOnboardingComponent} from "./pages/shiftcontrol/plan-onboarding/plan-onboarding.component";
import {ManageEventDetailsComponent} from "./components/manage-event-details/manage-event-details.component";
import {ManageScheduleComponent} from "./pages/shiftcontrol/event/manage-schedule/manage-schedule.component";
import {NotificationsComponent} from "./pages/shiftcontrol/notifications/notifications.component";
import {ShiftPlanSignupDashboardComponent} from "./pages/shiftcontrol/shift-plan-signup-dashboard/shift-plan-signup-dashboard.component";
import {ManageShiftPlansComponent} from "./pages/shiftcontrol/event/manage-shift-plans/manage-shift-plans.component";
import {ManageEventComponent} from "./pages/shiftcontrol/event/manage-event/manage-event.component";

export const routes: Routes = ([
  { path: "", component: HomeComponent, pathMatch: "full", data: {breadcrumbs: BC_HOME}, canActivate: [accessAllowedGuard] },
  { path: "login", component: LoginComponent, canActivate: [notLoggedInGuard] },
  { path: "me", component: AccountComponent,
    data: {breadcrumbs: BC_ACCOUNT}, canActivate: [accessAllowedGuard]},
  { path: "notifications", component: NotificationsComponent,
    data: {breadcrumbs: BC_NOTIFICATIONS}, canActivate: [accessAllowedGuard]},

  /* events */
  { path: "events", component: EventsComponent,
    data: {breadcrumbs: BC_EVENTS}, canActivate: [accessAllowedGuard]},
  { path: "events/create", component: ManageEventDetailsComponent,
    data: {breadcrumbs: BC_EVENT_CREATE}, canActivate: [accessAllowedGuard]},
  { path: "events/:eventId", component: EventComponent,
    data: {breadcrumbs: BC_EVENT}, canActivate: [accessAllowedGuard]},
  { path: "events/:eventId/calendar", component: ManageScheduleComponent,
    data: {breadcrumbs: BC_EVENT_SCHEDULE}, canActivate: [accessAllowedGuard]},
  { path: "events/:eventId/plans", component: ManageShiftPlansComponent,
    data: {breadcrumbs: BC_EVENT_PLANS}, canActivate: [accessAllowedGuard]},
  { path: "events/:eventId/edit", component: ManageEventComponent,
    data: {breadcrumbs: BC_EVENT_EDIT}, canActivate: [accessAllowedGuard]},


  /* shiftplans */
  { path: "plans/:shiftPlanId", component: ShiftPlanComponent,
    data: { breadcrumbs: BC_PLAN_DASHBOARD }, canActivate: [accessAllowedGuard]},
  { path: "plans/:shiftPlanId/signup-dashboard", component: ShiftPlanSignupDashboardComponent,
    data: { breadcrumbs: BC_PLAN_SIGNUP_DASHBOARD }, canActivate: [accessAllowedGuard]},
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
