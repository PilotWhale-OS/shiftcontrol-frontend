import {Component, inject} from "@angular/core";
import {PageService} from "../../services/page/page.service";
import {BC_PLAN_DASHBOARD, BC_SHIFT_DETAILS, BC_EVENT} from "../../breadcrumbs";
import {DialogShiftAuctionComponent} from "../dialog-shift-auction/dialog-shift-auction.component";
import {DialogShiftSignupComponent} from "../dialog-shift-signup/dialog-shift-signup.component";
import {DialogShiftTradeComponent} from "../dialog-shift-trade/dialog-shift-trade.component";
import {faCalendar, faCertificate, faGift, faLocationDot, faLock, faPeopleGroup, faStar} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TooltipDirective} from "../../directives/tooltip.directive";
import {PositionSlotDto, VolunteerDto} from "../../../shiftservice-client";
import {ShiftDetailsPositionComponent} from "../shift-details-position/shift-details-position.component";

@Component({
  selector: "app-shift-details-view",
  imports: [
    DialogShiftAuctionComponent,
    DialogShiftSignupComponent,
    DialogShiftTradeComponent,
    FaIconComponent,
    TooltipDirective,
    ShiftDetailsPositionComponent
  ],
  standalone: true,
  templateUrl: "./shift-details-view.component.html",
  styleUrl: "./shift-details-view.component.scss"
})
export class ShiftDetailsViewComponent {

  public showAuctionDialog = false;
  public showSignupDialog = false;
  public showTradeDialog = false;

  protected readonly iconLocation = faLocationDot;
  protected readonly iconDate = faCalendar;
  protected readonly iconActivity = faStar;
  protected readonly iconReward = faGift;
  protected readonly iconStatus = faCertificate;
  protected readonly iconSlots = faPeopleGroup;
  protected readonly iconLockedPhase = faLock;

  protected readonly PositionSlotDto = PositionSlotDto;

  private readonly _pageService = inject(PageService);

  constructor() {
    this._pageService
      .configureBreadcrumb(BC_EVENT, "Pilot Event", "eventId")
      .configureBreadcrumb(BC_PLAN_DASHBOARD, "Pilot Plan", "/plans/planId")
      .configureBreadcrumb(BC_SHIFT_DETAILS, "Pilot Shift", "shiftId");
  }

  protected createDemoPosition(name: string, description: string, volCount: number, assCount: number,
                               state: PositionSlotDto.SignupStateEnum): PositionSlotDto{
    return {
      id: "asdasd",
      associatedShiftId: "asdas",
      role: {
        name: name,
        description: description,
        id: "asda"
      },
      assignedVolunteers: Array(assCount) as unknown as VolunteerDto[],
      locations: {
        id: 0,
        name: "Venue A"
      },
      signupState: state,
      desiredVolunteerCount: volCount
    };
  }
}
