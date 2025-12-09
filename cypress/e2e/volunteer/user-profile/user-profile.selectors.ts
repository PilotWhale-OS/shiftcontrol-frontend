const SELECTORS_USER_PROFILE = {
  CARDS: {
    USER_SETTINGS: 'Account Information',
    NOTIFICATION_SETTINGS: 'Notifications',
    UNAVAILABILITY_SETTINGS: 'Unavailability',
  },
  USER_SETTINGS: {
    name: 'xsb-input-text[ng-reflect-name="userGivenName"]',
    surname: 'xsb-input-text[ng-reflect-name="userLastName"]',
    manageAccount: '[name="me-manage-account"]',
    signOut: '[name="me-sign-out"]',
  },
  NOTIFICATION_SETTINGS: {
    emailNotification: 'xsb-input-toggle[ng-reflect-name="me-notifications-email"]',
    pushNotification: 'xsb-input-toggle[ng-reflect-name="me-notifocations-push"]',
    autoAssigned: 'xsb-input-toggle[ng-reflect-name="me-notifocations-push"]',
    tradeAccepted: 'xsb-input-toggle[ng-reflect-name="me-topic-tradeaccepted"]',
    shiftReminder: 'xsb-input-toggle[ng-reflect-name="me-topic-shiftreminder"]',
  },
  UNAVAILABILITY_SETTINGS: {
    // todo add
  },

};
export default SELECTORS_USER_PROFILE;
