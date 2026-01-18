import {Breadcrumb} from "./util/breadcrumb";

/* note: name and href should be customized by the component specifically to selected path, if applicable */
export const BC_HOME = new Breadcrumb("Home", "/");
export const BC_ACCOUNT = new Breadcrumb("Account", "/account", BC_HOME);
export const BC_NOTIFICATIONS = new Breadcrumb("Notifications", "/notifications", BC_HOME);

export const BC_EVENTS = new Breadcrumb("Events", "/events", BC_HOME);
export const BC_EVENT = new Breadcrumb("Event", "event-id", BC_EVENTS);
export const BC_EVENT_CREATE = new Breadcrumb("Create Event", "create", BC_EVENTS);
export const BC_EVENT_EDIT = new Breadcrumb("Manage", "manage", BC_EVENT);
export const BC_EVENT_PLANS = new Breadcrumb("Shift Plans", "plans", BC_EVENT);
export const BC_EVENT_HELP = new Breadcrumb("Help", "help", BC_EVENT);

export const BC_PLAN_ONBOARDING = new Breadcrumb("Onboarding", "onboarding", BC_EVENT);
export const BC_SHIFT_CALENDAR = new Breadcrumb("Calendar", "calendar", BC_EVENT);
export const BC_SHIFT_DETAILS = new Breadcrumb("Shift Details", "shift-id", BC_EVENT);
