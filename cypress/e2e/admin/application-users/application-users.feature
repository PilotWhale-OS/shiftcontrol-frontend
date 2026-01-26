Feature: Admin application users

  Background:
    Given I log in as admin

  Scenario: Open application users page
    When I open the admin page "volunteers"
    Then I should see the admin heading "About Volunteers"
