Feature: Plan page

  Background:
    Given I log in as volunteer

  Scenario: I navigate to a specific plan
    Given I navigate to the dashboard page
    Then I navigate to the events page from the dashboard page
    Then I navigate to a event page from the events page
    Then I navigate to a plan page from the event page

  Scenario: I navigate to a specific plan
    Given I navigate to the dashboard page
    Then I navigate to a plan page from the dashboard page
