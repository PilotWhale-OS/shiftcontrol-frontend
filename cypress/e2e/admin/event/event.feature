Feature: Admin event page

  Background:
    Given I log in as admin

  Scenario: Open admin event page
    Given I open the admin event page
    Then I should see the admin event cards
