Feature: Admin audit log

  Background:
    Given I log in as admin

  Scenario: Open audit log page
    When I open the admin page "audit"
    Then I should see the admin heading "Audit Log"
