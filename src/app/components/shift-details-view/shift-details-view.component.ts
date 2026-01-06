import {Component, inject} from "@angular/core";
import {PageService} from "../../services/page/page.service";
import {BC_EVENT, BC_PLAN_DASHBOARD, BC_SHIFT_DETAILS} from "../../breadcrumbs";
import {DialogShiftAuctionComponent} from "../dialog-shift-auction/dialog-shift-auction.component";
import {DialogShiftSignupComponent} from "../dialog-shift-signup/dialog-shift-signup.component";
import {DialogShiftTradeComponent} from "../dialog-shift-trade/dialog-shift-trade.component";
import {faCalendar, faGift, faLocationDot, faLock, faStar} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TooltipDirective} from "../../directives/tooltip.directive";
import {AssignmentDto, PositionSlotDto, ShiftDto} from "../../../shiftservice-client";
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
  protected readonly iconLockedPhase = faLock;

  protected readonly PositionSlotDto = PositionSlotDto;
  protected readonly demoShift: ShiftDto = {
    id: "asd",
    name: "test",
    startTime: "asdasdasd",
    endTime: "asdasdasd",
    relatedActivity: undefined,
    positionSlots: [],
    bonusRewardPoints: 0,
    location: {
      id: "asdff",
      name: "Stage 1",
      readOnly: false
    },
    lockStatus: "SELF_SIGNUP"
  };

  private readonly _pageService = inject(PageService);

  constructor() {
    this._pageService
      .configureBreadcrumb(BC_EVENT, "Pilot Event", "eventId")
      .configureBreadcrumb(BC_PLAN_DASHBOARD, "Pilot Plan", "/plans/planId")
      .configureBreadcrumb(BC_SHIFT_DETAILS, "Pilot Shift", "shiftId");
  }

  protected createDemoPosition(name: string, description: string, volCount: number, assCount: number,
                               state: PositionSlotDto.PositionSignupStateEnum): PositionSlotDto{
    return {
      id: "asdasd",
      name: "asdas",
      description: "asdasd",
      skipAutoAssignment: false,
      associatedShiftId: "asdas",
      role: {
        name: name,
        description: description,
        id: "asda",
        selfAssignable: false,
        rewardPointsPerMinute: 1
      },
      preferenceValue: 0,
      rewardPointsDto: {
        currentRewardPoints: 100,
        rewardPointsConfigHash: ""
      },
      assignments: Array(assCount) as unknown as AssignmentDto[],
      positionSignupState: state,
      desiredVolunteerCount: volCount,
      tradeInfoDtos: [],
      auctions: [],
      lockStatus: "SELF_SIGNUP"
    };
  }
}
