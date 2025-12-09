import {BaseWorkflow} from "../../../models/base.workflow";
import SELECTORS_EVENTS from "./event.selectors";
import eventPo from "./event.po";

export class EventWorkflow extends BaseWorkflow {
  constructor() {
    super(SELECTORS_EVENTS);
  }

  visitEventPage() {
    eventPo.navigateOverCard(SELECTORS_EVENTS.CARDS.EVENT, eventPo.getPageUrl() + "/someid");
  }

  visitPlanPage() {
    eventPo.navigateOverCard(SELECTORS_EVENTS.CARDS.PLAN, "events/someid/otherid");
  }

}
