import {WorkflowFactory} from "../../../models/workflow.factory";
import {Given} from "@badeball/cypress-cucumber-preprocessor";
import {EventWorkflow} from "./event.workflow";

const wf = WorkflowFactory.get<EventWorkflow>('events');

Given('I navigate to a event from the events page', () => {

});

Given('I navigate to a plan from the event page', () => {

});
