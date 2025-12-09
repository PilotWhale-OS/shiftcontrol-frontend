import {WorkflowFactory} from "../../../models/workflow.factory";
import {Given} from "@badeball/cypress-cucumber-preprocessor";
import {ShiftPlanWorkflow} from "./shift-plan.workflow";

const wf = WorkflowFactory.get<ShiftPlanWorkflow>('shiftPlans');

Given('I navigate to a shift page from a plan page', () => {
  wf.visitShiftPage();
});
