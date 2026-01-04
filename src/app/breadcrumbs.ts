import {Breadcrumb} from "./util/breadcrumb";

/* note: name and href should be customized by the component specifically to selected path, if applicable */
export const BC_HOME = new Breadcrumb("Home", "/");
export const BC_ACCOUNT = new Breadcrumb("Account", "/account", BC_HOME);

export const BC_EVENTS = new Breadcrumb("Events", "/events", BC_HOME);
export const BC_EVENT = new Breadcrumb("Event", "event-id", BC_EVENTS);
export const BC_EVENT_CREATE = new Breadcrumb("Create Event", "create", BC_EVENTS);
export const BC_EVENT_EDIT = new Breadcrumb("Manage", "edit", BC_EVENT);
export const BC_EVENT_SCHEDULE = new Breadcrumb("Calendar", "calendar", BC_EVENT);

export const BC_PLAN_DASHBOARD = new Breadcrumb("Shift Dashboard", "/plans/plan-id", BC_EVENT);
export const BC_PLAN_CREATE = new Breadcrumb("Create Shift Plan", "create", BC_EVENT);
export const BC_PLAN_EDIT = new Breadcrumb("Manage", "edit", BC_PLAN_DASHBOARD);

export const BC_SHIFT_CALENDAR = new Breadcrumb("Calendar", "calendar", BC_PLAN_DASHBOARD);
export const BC_SHIFT_DETAILS = new Breadcrumb("Shift Details", "shift-id", BC_PLAN_DASHBOARD);
export const BC_PLAN_ONBOARDING = new Breadcrumb("Onboarding", "onboarding", BC_PLAN_DASHBOARD);

