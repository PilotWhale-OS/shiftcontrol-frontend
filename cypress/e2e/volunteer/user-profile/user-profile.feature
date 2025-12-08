Feature: User profile page

  Background:
    Given I log in as volunteer
    When I navigate to the user profile page
    Then I verify the user profile page

  Scenario: Press cards for routing to user profile page
    Given I navigate to the dashboard page
    Then I navigate to the user settings page from the dashboard page

  Scenario: Profile tiles are visible
    Then The user profile page tiles exist
    And the form should contain the following data on "userProfile"
      | name | surname |
      | Max  | Muster  |
    And the form should contain the following data on "userProfile"
      | emailNotification | pushNotification | autoAssigned | tradeAccepted | shiftReminder |
      | false             | false            | false        | false         | false         |

