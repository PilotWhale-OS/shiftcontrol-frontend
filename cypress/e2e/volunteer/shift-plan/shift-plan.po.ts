import {BasePage} from "../../../models/base-page";
import {APP_CONFIG} from "../../../config";

class ShiftPlanPage extends BasePage {
  constructor() {
    super(APP_CONFIG.BASE_URL, '');
  }

}

export default new ShiftPlanPage();
