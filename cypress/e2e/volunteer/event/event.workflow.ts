import {BaseWorkflow} from "../../../models/base.workflow";
import SELECTORS_EVENTS from "./event.selectors";

export class EventWorkflow extends BaseWorkflow {
  constructor() {
    super(SELECTORS_EVENTS);
  }


}
