Feature: Volunteer home

  Background:
    Given I log in as volunteer

  Scenario: See home content
    When I navigate to the home page
    Then I should see the home page content
