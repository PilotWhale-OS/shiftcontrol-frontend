import {WorkflowFactory} from "../../../models/workflow.factory";
import {Given} from "@badeball/cypress-cucumber-preprocessor";
import {EventWorkflow} from "./event.workflow";

const wf = WorkflowFactory.get<EventWorkflow>('events');

Given('I navigate to a event page from the events page', () => {
  wf.visitEventPage();
});

Given('I navigate to a plan page from the event page', () => {
  wf.visitPlanPage();
});
