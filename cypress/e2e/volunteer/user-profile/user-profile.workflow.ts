import {BaseWorkflow} from '../../../models/base.workflow';
import SELECTORS_USER_PROFILE from "./user-profile.selectors";
import userProfilePo from "./user-profile.po";
import {APP_CONFIG} from "../../../config";

export class UserProfileWorkflow extends BaseWorkflow {
  constructor() {
    super(SELECTORS_USER_PROFILE);
  }

  visitUserSettingsPage() {
    userProfilePo.visitUserSettingsPage()
    cy.wait(APP_CONFIG.TIMEOUT_L);
  }

  verifyUserSettingsPage() {
    userProfilePo.verifyPageUrl()
  }

  verifyAllTilesAreShown() {
    userProfilePo.verifyAllCardsAreShown()
  }
}
