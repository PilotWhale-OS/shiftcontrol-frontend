import {BaseWorkflow} from '../../../models/base.workflow';
import SELECTORS_SHIFT_DASHBOARD from "./shift-dashboard.selectors";
import shiftDashboardPo from "./shift-dashboard.po";
import userProfilePo from "../user-profile/user-profile.po";

export class ShiftDashBoardWorkflow extends BaseWorkflow {
  constructor() {
    super(SELECTORS_SHIFT_DASHBOARD);
  }

  visitShiftDashboardPage() {
    shiftDashboardPo.visitPageUrl()
  }

  verifyAllCardsAreShown() {
    shiftDashboardPo.verifyTileItemsAreShown(SELECTORS_SHIFT_DASHBOARD.CARDS);
  }

  visitUserSettingsPage() {
    shiftDashboardPo.navigateOverCards([SELECTORS_SHIFT_DASHBOARD.CARDS.USER_PROFILE, userProfilePo])
  }
}
