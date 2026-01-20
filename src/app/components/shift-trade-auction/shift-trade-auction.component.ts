import {Component, inject, Input, Output} from "@angular/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TooltipDirective} from "../../directives/tooltip.directive";
import {icons} from "../../util/icons";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {BehaviorSubject, combineLatestWith, forkJoin, map, Subject, switchMap} from "rxjs";
import {AssignmentDto, PositionSlotEndpointService, ShiftEndpointService, TradeDto} from "../../../shiftservice-client";
import {UserService} from "../../services/user/user.service";
import {AsyncPipe, DatePipe} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: "app-shift-trade-auction",
  imports: [
    FaIconComponent,
    TooltipDirective,
    InputButtonComponent,
    AsyncPipe,
    DatePipe,
    RouterLink
  ],
  standalone: true,
  templateUrl: "./shift-trade-auction.component.html",
  styleUrl: "./shift-trade-auction.component.scss"
})
export class ShiftTradeAuctionComponent {

  @Output()
  public readonly itemsChanged = new Subject<void>();

  protected readonly trades$ = new BehaviorSubject<TradeDto[]>([]);
  protected readonly auctions$ = new BehaviorSubject<AssignmentDto[]>([]);

  protected readonly relevantSlots$ = this.trades$.pipe(
    map(trades => trades.flatMap(trade => [trade.requestedAssignment.positionSlotId, trade.offeringAssignment.positionSlotId])),
    combineLatestWith(this.auctions$.pipe(
      map(auctions => auctions.map(auction => auction.positionSlotId))
    )),
    map(([tradeSlots, auctionSlots]) => [...tradeSlots, ...auctionSlots]),
    map(ids => Array.from(new Set(ids))),
    switchMap(ids => forkJoin(ids.map(id => this._positionService.getPositionSlot(id)))),
    map(slots => new Map(slots.map(slot => [slot.id, slot])))
  );

  protected readonly relevantShifts$ = this.relevantSlots$.pipe(
    map(positions => [...positions.values()].map(position => position.associatedShiftId)),
    map(ids => Array.from(new Set(ids))),
    switchMap(ids => forkJoin(ids.map(id => this._shiftService.getShiftDetails(id)))),
    map(shifts => new Map(shifts.map(shift => [shift.shift.id, shift.shift])))
  );

  protected readonly auctionData$ = this.auctions$.pipe(
    combineLatestWith(this.relevantSlots$, this.relevantShifts$),
    map(([auctions, slots, shifts]) => auctions.map(auction => ({
      auction,
      initials: `${auction.assignedVolunteer.firstName.substring(0,1)}${auction.assignedVolunteer.lastName.substring(0,1)}`,
      title: `${auction.assignedVolunteer.firstName} ${auction.assignedVolunteer.lastName.substring(0,1)}. offers their position in ` +
        `${slots.get(auction.positionSlotId)?.name}`,
      slot: slots.get(auction.positionSlotId),
      shift: shifts.get(slots.get(auction.positionSlotId)?.associatedShiftId ?? ""),
      caption: {
        name: `${auction.assignedVolunteer.firstName} ${auction.assignedVolunteer.lastName.substring(0,1)}.`,
        middle: " offers their position in ",
        shiftName: shifts.get(slots.get(auction.positionSlotId)?.associatedShiftId ?? "")?.name ?? ""
      }
    })))
  );

  protected readonly tradeData$;

  protected readonly icons = icons;

  private readonly _positionService = inject(PositionSlotEndpointService);
  private readonly _shiftService = inject(ShiftEndpointService);
  private readonly _userService = inject(UserService);

  constructor() {
    this.tradeData$ = this.trades$.pipe(
      combineLatestWith(this.relevantSlots$, this.relevantShifts$, this._userService.userProfile$),
      map(([trades, slots, shifts, user]) => trades.map(trade => {
        const isOwnRequest = trade.offeringAssignment.assignedVolunteer.id === user?.account.volunteer.id;
        const otherVolunteer = isOwnRequest ?
          trade.requestedAssignment.assignedVolunteer :
          trade.offeringAssignment.assignedVolunteer;
        const otherAssignment = isOwnRequest ?
          trade.requestedAssignment :
          trade.offeringAssignment;
        const ownAssignment = isOwnRequest ?
          trade.offeringAssignment :
          trade.requestedAssignment;

        return {
          trade,
          isOwnRequest,
          otherVolunteer,
          initials: `${otherVolunteer.firstName.substring(0,1)}${otherVolunteer.lastName.substring(0,1)}`,
          otherPosition: slots.get(otherAssignment.positionSlotId),
          otherShift: shifts.get(slots.get(otherAssignment.positionSlotId)?.associatedShiftId ?? ""),
          ownPosition: slots.get(ownAssignment.positionSlotId),
          ownShift: shifts.get(slots.get(ownAssignment.positionSlotId)?.associatedShiftId ?? ""),
          caption: {
            pre: isOwnRequest ? "You asked " : "",
            name: isOwnRequest ?
              `${otherVolunteer.firstName} ${otherVolunteer.lastName.substring(0,1)}.` :
              `${otherVolunteer.firstName} ${otherVolunteer.lastName.substring(0,1)}.`,
            middle: isOwnRequest ? " to trade their position in " : " wants to trade their position in ",
            shiftName: shifts.get(slots.get(otherAssignment.positionSlotId)?.associatedShiftId ?? "")?.name ?? ""
          }
        };
      }))
    );
  }

  @Input()
  public set trades(trades: TradeDto[]) {
    this.trades$.next(trades);
  }

  @Input()
  public set auctions(auctions: AssignmentDto[]) {
    this.auctions$.next(auctions);
  }

}
