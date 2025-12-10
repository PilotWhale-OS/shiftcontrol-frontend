import {Component, inject} from "@angular/core";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {PageService} from "../../services/breadcrumbs/page.service";
import {BC_PLAN_DASHBOARD, BC_SHIFT_DETAILS, BC_EVENT} from "../../breadcrumbs";
import {DialogShiftAuctionComponent} from "../dialog-shift-auction/dialog-shift-auction.component";
import {DialogShiftSignupComponent} from "../dialog-shift-signup/dialog-shift-signup.component";
import {DialogShiftTradeComponent} from "../dialog-shift-trade/dialog-shift-trade.component";

@Component({
  selector: "app-shift-details-view",
  imports: [
    InputButtonComponent,
    DialogShiftAuctionComponent,
    DialogShiftSignupComponent,
    DialogShiftTradeComponent
  ],
  standalone: true,
  templateUrl: "./shift-details-view.component.html",
  styleUrl: "./shift-details-view.component.scss"
})
export class ShiftDetailsViewComponent {

  public showAuctionDialog = false;
  public showSignupDialog = false;
  public showTradeDialog = false;

  private readonly _pageService = inject(PageService);

  constructor() {
    this._pageService
      .configureBreadcrumb(BC_EVENT, "Pilot Event", "eventId")
      .configureBreadcrumb(BC_PLAN_DASHBOARD, "Pilot Plan", "/plans/planId")
      .configureBreadcrumb(BC_SHIFT_DETAILS, "Pilot Shift", "shiftId");
  }
}
