import {WorkflowFactory} from "../../../models/workflow.factory";
import {Given} from "@badeball/cypress-cucumber-preprocessor";
import {ShiftDetailWorkflow} from "./shift-detail.workflow";

const wf = WorkflowFactory.get<ShiftDetailWorkflow>('shiftDetail');

Given('I navigate to a event from the events page', () => {
  throw new Error('Step not implemented');
});
