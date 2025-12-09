import {BaseWorkflow} from "../../../models/base.workflow";
import SELECTORS_SHIFT_PLAN from "./shift-plan.selectors";

export class ShiftPlanWorkflow extends BaseWorkflow {
  constructor() {
    super(SELECTORS_SHIFT_PLAN);
  }


}
