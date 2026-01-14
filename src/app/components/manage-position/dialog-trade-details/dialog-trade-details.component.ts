import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {
  AssignmentDto,
  PositionSlotDto,
  PositionSlotEndpointService, PositionSlotTradeEndpointService, ShiftDetailsDto,
  ShiftEndpointService,
  TradeInfoDto,
  VolunteerDto
} from "../../../../shiftservice-client";
import {BehaviorSubject, combineLatestWith, filter, map, Observable, of, switchMap} from "rxjs";
import {UserService} from "../../../services/user/user.service";
import {AsyncPipe, DatePipe, SlicePipe} from "@angular/common";
import {DialogComponent, dialogResult} from "../../dialog/dialog.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {icons} from "../../../util/icons";
import {ToastService} from "../../../services/toast/toast.service";
import {mapValue} from "../../../util/value-maps";

interface mappedInfo {
  isOwnRequest: boolean;
  ownRewardPoints: number;
  otherRewardPoints: number;
  ownVolunteer: VolunteerDto;
  otherVolunteer: VolunteerDto;
  ownSlot: PositionSlotDto;
  otherSlot: PositionSlotDto;
  ownShift: ShiftDetailsDto;
  otherShift: ShiftDetailsDto;
}

@Component({
  selector: "app-dialog-trade-details",
  imports: [
    AsyncPipe,
    SlicePipe,
    DialogComponent,
    FaIconComponent,
    DatePipe
  ],
  templateUrl: "./dialog-trade-details.component.html",
  styleUrl: "./dialog-trade-details.component.scss"
})
export class DialogTradeDetailsComponent {

  @Output()
  tradeChanged = new EventEmitter<AssignmentDto>();

  protected icons = icons;

  protected tradeInfo$ = new BehaviorSubject<TradeInfoDto | undefined>(undefined);
  protected mappedInfo$: Observable<mappedInfo | undefined>;

  private readonly _userService = inject(UserService);
  private readonly _positionService = inject(PositionSlotEndpointService);
  private readonly _shiftService = inject(ShiftEndpointService);
  private readonly _tradeService = inject(PositionSlotTradeEndpointService);
  private readonly _toastService = inject(ToastService);

  constructor() {
    this.mappedInfo$ = this.tradeInfo$.pipe(
      switchMap(_info => _info === undefined ? of(undefined) : of(_info).pipe(
        combineLatestWith(this._userService.userProfile$.pipe(
          filter(user => user !== null)
        )),
        switchMap(([info, user]) => of([info, user] as const).pipe(
          combineLatestWith(
            this._positionService.getPositionSlot(info.offeredPositionSlotId),
            this._positionService.getPositionSlot(info.requestedPositionSlotId)
          )
        )),
        switchMap(([[info, user], offeredSlot, requestedSlot]) => of([info, user, offeredSlot, requestedSlot] as const).pipe(
          combineLatestWith(
            this._shiftService.getShiftDetails(offeredSlot.associatedShiftId),
            this._shiftService.getShiftDetails(requestedSlot.associatedShiftId)
          ),
        )),
        map(([[info, user, offeredSlot, requestedSlot], offeredShift, requestedShift]) => {
          const isOwnRequest = info.offeringVolunteer.id === user.account.volunteer.id;

          return {
            isOwnRequest,
            ownRewardPoints: isOwnRequest ? info.offeredPositionSlotRewardPoints : info.requestedPositionSlotRewardPoints,
            otherRewardPoints: isOwnRequest ? info.requestedPositionSlotRewardPoints : info.offeredPositionSlotRewardPoints,
            ownVolunteer: isOwnRequest ? info.offeringVolunteer : info.requestedVolunteer,
            otherVolunteer: isOwnRequest ? info.requestedVolunteer : info.offeringVolunteer,
            ownSlot: isOwnRequest ? offeredSlot : requestedSlot,
            otherSlot: isOwnRequest ? requestedSlot : offeredSlot,
            ownShift: isOwnRequest ? offeredShift : requestedShift,
            otherShift: isOwnRequest ? requestedShift : offeredShift,
          };
        })
      )
    ));
  }

  @Input()
  public set tradeInfo(info: TradeInfoDto | undefined) {
    this.tradeInfo$.next(info);
  }

  protected processResult(result: dialogResult, tradeData: mappedInfo) {

    if(tradeData.isOwnRequest) {
      if(result === "danger") {
        /* this._tradeService.cancelTrade();*/
      }
    } else {
      if(result ==="success") {
        this._tradeService.acceptTrade({
          offeredSlot: tradeData.otherSlot.id,
          requestedSlot: tradeData.ownSlot.id,
          offeringVolunteer: tradeData.otherVolunteer.id
        }).pipe(
          this._toastService.tapSuccess("Trade Accepted", () => "The trade has been accepted successfully."),
          this._toastService.tapError("Trade Failed", mapValue.apiErrorToMessage)
        ).subscribe((trade) => this.tradeChanged.emit(trade.requestedAssignment));
      } else if(result === "danger") {

      }
    }

  }

}
