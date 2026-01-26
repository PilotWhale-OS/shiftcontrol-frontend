import {Given, Then} from "@badeball/cypress-cucumber-preprocessor";
import {WorkflowFactory} from "../../../models/workflow.factory";
import {HomeWorkflow} from "./home.workflow";

const wf = WorkflowFactory.get<HomeWorkflow>("home");

Given("I navigate to the home page", () => {
  wf.visitHomePage();
});

Then("I should see the home page content", () => {
  cy.contains("h1", "Welcome back").should("be.visible");
  cy.contains(".card h1", "Events").should("exist");
});
