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
    emailNotification: 'xsb-input-toggle[ng-reflect-name="userNotificationsEmail"]',
    pushNotification: 'xsb-input-toggle[ng-reflect-name="userNotificationsPush"]',
    autoAssigned: 'xsb-input-toggle[ng-reflect-name="userNotificationsAutoAssigned"]',
    tradeAccepted: 'xsb-input-toggle[ng-reflect-name="userNotificationsTradeAccepted"]',
    shiftReminder: 'xsb-input-toggle[ng-reflect-name="userNotificationsShiftReminder"]',
  },
  UNAVAILABILITY_SETTINGS: {
    // todo add
  },

};
export default SELECTORS_USER_PROFILE;
