Feature: Event page

  Background:
    Given I log in as volunteer

  Scenario: I navigate to a specific event
    Given I navigate to the dashboard page
    Then I navigate to the events page from the dashboard page
    Then I navigate to a event page from the events page
