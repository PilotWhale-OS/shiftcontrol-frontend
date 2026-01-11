import {Component, EventEmitter, inject, Input, OnInit, Output} from "@angular/core";
import {BehaviorSubject, combineLatestWith, filter, map, switchMap} from "rxjs";
import {
  AssignmentDto,
  PositionSlotDto,
  PositionSlotEndpointService, PositionSlotTradeEndpointService,
  ShiftDto, ShiftPlanDto, TradeCandidatesDto, TradeInfoDto
} from "../../../../shiftservice-client";
import {icons} from "../../../util/icons";
import {AsyncPipe} from "@angular/common";
import {InputButtonComponent} from "../../inputs/input-button/input-button.component";
import {ToastService} from "../../../services/toast/toast.service";
import {mapValue} from "../../../util/value-maps";
import LockStatusEnum = ShiftPlanDto.LockStatusEnum;
import {UserService} from "../../../services/user/user.service";
import {DialogComponent} from "../../dialog/dialog.component";

export interface positionSignupParams {
  slot: PositionSlotDto;
  shift: ShiftDto;
  currentUserAssignment?: AssignmentDto;
}

interface signupOptions {
  availableTrades: TradeInfoDto[];
  slot: PositionSlotDto;
}

interface tradeRequestOptions {
  slot: PositionSlotDto;
  candidates: TradeCandidatesDto[];
}

@Component({
  selector: "app-position-signup",
  imports: [
    AsyncPipe,
    InputButtonComponent,
    DialogComponent
  ],
  standalone: true,
  templateUrl: "./position-signup.component.html",
  styleUrl: "./position-signup.component.scss"
})
export class PositionSignupComponent implements OnInit {

  @Output()
  public positionSignupChanged = new EventEmitter<AssignmentDto>();

  protected readonly icons = icons;

  protected readonly signupOptions$ = new BehaviorSubject<signupOptions | undefined>(undefined);
  protected readonly tradeRequestOptions$ = new BehaviorSubject<tradeRequestOptions | undefined>(undefined);
  protected readonly hasInited$ = new BehaviorSubject<boolean>(false);
  protected readonly position$ = new BehaviorSubject<positionSignupParams | undefined>(undefined);
  protected readonly header$ = this.position$.pipe(
    map(position => this.getHeader(position?.slot))
  );
  protected readonly body$ = this.position$.pipe(
    combineLatestWith(this.currentUserId$),
    map(([position, userId]) => this.getBody(position, userId))
  );
  protected readonly actions$ = this.position$.pipe(
    combineLatestWith(this.currentUserId$),
    map(([position, userId]) => this.getActions(position, userId))
  );

  private readonly _positionService = inject(PositionSlotEndpointService);
  private readonly _tradeService = inject(PositionSlotTradeEndpointService);
  private readonly _toastService = inject(ToastService);
  private readonly _userService = inject(UserService);

  protected get currentUserId$() {
    return this.hasInited$.pipe(
      filter(inited => inited),
      switchMap( () => this._userService.userProfile$.pipe(
          map(profile => profile?.account?.volunteer.id ?? undefined),
          filter(id => id !== undefined)
        )
      ));
  }

  @Input()
  public set positionSlot(value: positionSignupParams | undefined) {
    this.position$.next(value);
  }

  public ngOnInit() {
    this.hasInited$.next(true);
  }

  /**
   * Initiate signup with direct assignment
   * @param slot
   * @param shift
   * @param userId
   * @protected
   */
  protected signUp(slot: PositionSlotDto, shift: ShiftDto, userId: string) {

    /* during self-signup phase, users can freely sign up if free slots */
    if(
      shift.lockStatus === LockStatusEnum.SelfSignup &&
      (
        slot.positionSignupState === PositionSlotDto.PositionSignupStateEnum.SignupPossible ||
        slot.positionSignupState === PositionSlotDto.PositionSignupStateEnum.SignupOrTrade
      )
    ) {
      this._positionService.joinPositionSlot(slot.id, {
        acceptedRewardPointsConfigHash: slot.rewardPointsDto.rewardPointsConfigHash
      }).pipe(
        this._toastService.tapSuccess("Signed Up",
          () => `You are now signed up for the position "${slot.name}". You can view your assignments in the shift plan dashboard.`),
        this._toastService.tapError("Could Not Sign Up", mapValue.apiErrorToMessage)
      ).subscribe(data => {
        this.positionSignupChanged.emit(data);
      });
      return;
    }

    /* during supervised phase, users can accept auctions */
    if(
      shift.lockStatus === LockStatusEnum.Supervised &&
      slot.positionSignupState === PositionSlotDto.PositionSignupStateEnum.SignupViaAuction
    ) {
      const auctions = slot.auctions.filter(auc => auc.assignedVolunteer.id !== userId);
      if(auctions.length === 0) {
        throw new Error("No available auctions for signing up to position.");
      }

      const auctionToAccept = auctions[0];
      this._positionService.claimAuction(auctionToAccept.positionSlotId, auctionToAccept.assignedVolunteer.id, {
        acceptedRewardPointsConfigHash: slot.rewardPointsDto.rewardPointsConfigHash
      }).pipe(
        this._toastService.tapSuccess("Signed Up",
          () => `You are now signed up for the position "${slot.name}". You can view your assignments in the shift plan dashboard.`),
        this._toastService.tapError("Could Not Sign Up", mapValue.apiErrorToMessage)
      ).subscribe(data => {
        this.positionSignupChanged.emit(data);
      });
      return;
    }

    /* during both phases, users can directly sign up if trades are available */
    if(
      slot.positionSignupState === PositionSlotDto.PositionSignupStateEnum.SignupOrTrade ||
      slot.positionSignupState === PositionSlotDto.PositionSignupStateEnum.SignupViaTrade
    ) {
      const trades = slot.tradeInfoDtos.filter(trade => trade.offeringVolunteer.id !== userId);
      if(trades.length === 0) {
        throw new Error("No available trades for signing up to position.");
      }

      /* handle selection in modal */
      this.signupOptions$.next({
        availableTrades: trades,
        slot: slot
      });
      return;
    }

    throw new Error("No available options for signing up to position.");
  }

  /**
   * Initiate signup that requires approval from another party
   * @param slot
   * @param shift
   * @protected
   */
  protected requestSignUp(slot: PositionSlotDto, shift: ShiftDto) {

    /* during supervised, if a regular signup would be possible, allow a signup request to be accepted by the admin */
    if(shift.lockStatus === LockStatusEnum.Supervised &&
      slot.positionSignupState === PositionSlotDto.PositionSignupStateEnum.SignupPossible
    ) {
      this._positionService.joinRequestPositionSlot(slot.id).pipe(
        this._toastService.tapSuccess("Requested Signup",
          () => `You requested to sign up to the position "${slot.name}". A shift planner will handle your request.`),
        this._toastService.tapError("Could Not Request Signup", mapValue.apiErrorToMessage)
      ).subscribe(data => {
        this.positionSignupChanged.emit(data);
      });
      return;
    }

    throw new Error("No available options for requesting position sign-up.");
  }

  /**
   * Initiate sign-out that requires approval from another party
   * @param slot
   * @param shift
   * @protected
   */
  protected requestSignOut(slot: PositionSlotDto, shift: ShiftDto) {

    /* during supervised phase, users can request to be unassigned */
    if(
      shift.lockStatus === LockStatusEnum.Supervised &&
      slot.positionSignupState === PositionSlotDto.PositionSignupStateEnum.SignedUp
    ) {
      this._positionService.leaveRequestPositionSlot(slot.id).pipe(
        this._toastService.tapSuccess("Requested Unassignment",
          () => `You requested to be unassigned from the position "${slot.name}". A shift planner will handle your request.`),
        this._toastService.tapError("Could Not Request Unassignment", mapValue.apiErrorToMessage)
      ).subscribe(data => {
        this.positionSignupChanged.emit(data);
      });
    }

    throw new Error("No available options for requesting position sign-out.");
  }

  /**
   * Initiate trade request
   * @param slot
   * @param shift
   * @protected
   */
  protected requestTrade(slot: PositionSlotDto, shift: ShiftDto) {

    /* if eligible and not in position, users can start a trade */
    if(
      slot.positionSignupState !== PositionSlotDto.PositionSignupStateEnum.SignedUp &&
      slot.positionSignupState !== PositionSlotDto.PositionSignupStateEnum.NotEligible
    ) {
      this._tradeService.getPositionSlotsToOffer(slot.id).subscribe(candidates => {
        this.tradeRequestOptions$.next({
          slot: slot,
          candidates: candidates
        });
      });
      return;
    }

    throw new Error("No available options for requesting trade.");
  }

  protected acceptTrade(slot: PositionSlotDto, trade: TradeInfoDto) {
    // TODO implement trade acceptance
  }

  protected submitTradeRequest(slot: PositionSlotDto, trade: TradeInfoDto) {
    // TODO implement trade acceptance
  }

  protected signOut(slot: PositionSlotDto) {
    this._positionService.leavePositionSlot(slot.id).pipe(
      this._toastService.tapSuccess("Successfully Unassigned",
        () => `You are no longer signed up for the position ${slot.name}.`),
      this._toastService.tapError("Could Not Unassign", mapValue.apiErrorToMessage)
    ).subscribe(data => {
      this.positionSignupChanged.emit(data);
    });
  }

  private getHeader(position: PositionSlotDto | undefined): string | undefined {
    if(position?.positionSignupState !== PositionSlotDto.PositionSignupStateEnum.SignedUp) {
      return undefined;
    }

    return "You are signed up for this position!";
  }

  private getBody(position: positionSignupParams | undefined, userId: string): string | undefined {
    if(position === undefined) {
      return undefined;
    }

    /* special case: assignment with request for (un)assign */
    if(position.currentUserAssignment !== undefined) {
      if(position.currentUserAssignment.status === AssignmentDto.StatusEnum.RequestForAssignment) {
        return "You have requested to be signed up.\nYou will be notified when a shift planner accepts or denies the request.";
      }
      if(position.currentUserAssignment.status === AssignmentDto.StatusEnum.AuctionRequestForUnassign) {
        return "You have requested to be unassigned.\nYou will be notified when a shift planner accepts or denies the request.";
      }
    }

    switch(position.slot.lockStatus) {

      case ShiftDto.LockStatusEnum.SelfSignup: {

        switch(position.slot.positionSignupState) {
          case PositionSlotDto.PositionSignupStateEnum.SignupPossible:
            return "You are eligible to sign up for this position.";
          case PositionSlotDto.PositionSignupStateEnum.SignupViaTrade:
            return "You are eligible to sign up for this position.";
          case PositionSlotDto.PositionSignupStateEnum.SignupViaAuction:
            return "INVALID_STATE";
          case PositionSlotDto.PositionSignupStateEnum.SignupOrTrade:
            return "You are eligible to sign up for this position.";
          case PositionSlotDto.PositionSignupStateEnum.SignedUp:
            return "Make sure to show up at the shift location at the specified time.";
          case PositionSlotDto.PositionSignupStateEnum.Full:
            return "The position slot is currently full.";
          case PositionSlotDto.PositionSignupStateEnum.NotEligible:
            return "You don't have the required roles to sign up for this position.";
          default:
            return "INVALID_STATE";
        }
      }

      case ShiftDto.LockStatusEnum.Supervised: {

        switch(position.slot.positionSignupState) {
          case PositionSlotDto.PositionSignupStateEnum.SignupPossible:
            return "Positions are currently locked.\n You can request a sign-up which will be checked by staff.";
          case PositionSlotDto.PositionSignupStateEnum.SignupViaTrade:
            return "Positions are currently locked, but you can accept a trade.";
          case PositionSlotDto.PositionSignupStateEnum.SignupViaAuction:
            return "Positions are currently locked, but you can accept a auction.";
          case PositionSlotDto.PositionSignupStateEnum.SignupOrTrade:
            return "INVALID_STATE";
          case PositionSlotDto.PositionSignupStateEnum.SignedUp:
            return `Make sure to show up at the location ${position.shift.location?.name} at the specified time.`;
          case PositionSlotDto.PositionSignupStateEnum.NotEligible:
            return "You don't have the required roles to sign up for this position.";
          default:
            return "INVALID_STATE";
        }
      }

      default: {
        return "Positions are currently locked.";
      }
    }
  }

  private getActions(position: positionSignupParams | undefined, userId: string): Array<
    "SIGN_UP" | "REQUEST_TRADE" | "SIGN_OUT" | "REQUEST_SIGN_UP" | "DISABLED_SIGN_UP" |
    "DISABLED_REQUEST_SIGN_UP" | "DISABLED_REQUEST_SIGN_OUT" | "REQUEST_SIGN_OUT"> | undefined {
    if (position === undefined) {
      return undefined;
    }

    const REQUEST_TRADE = position.slot.assignments.length > 0 ? ["REQUEST_TRADE"] as const : [] as const;

    /* special case: assignment with request for (un)assign */
    if(position.currentUserAssignment !== undefined) {
      if(position.currentUserAssignment.status === AssignmentDto.StatusEnum.RequestForAssignment) {
        return ["DISABLED_REQUEST_SIGN_UP", ...REQUEST_TRADE]; // can create trade to this position while being in requested state
      }
      if(position.currentUserAssignment.status === AssignmentDto.StatusEnum.AuctionRequestForUnassign) {
        return ["DISABLED_REQUEST_SIGN_OUT"]; // is still signed up, cant trade to this position
      }
    }

    switch(position.slot.lockStatus) {

      case ShiftDto.LockStatusEnum.SelfSignup: {

        switch(position.slot.positionSignupState) {
          case PositionSlotDto.PositionSignupStateEnum.SignupPossible:
          case PositionSlotDto.PositionSignupStateEnum.SignupViaTrade:
          case PositionSlotDto.PositionSignupStateEnum.SignupViaAuction:
          case PositionSlotDto.PositionSignupStateEnum.SignupOrTrade:
            return ["SIGN_UP", ...REQUEST_TRADE];
          case PositionSlotDto.PositionSignupStateEnum.SignedUp:
            return ["SIGN_OUT"];
          case PositionSlotDto.PositionSignupStateEnum.Full:
            return [...REQUEST_TRADE];
          case PositionSlotDto.PositionSignupStateEnum.NotEligible:
            return ["DISABLED_SIGN_UP"];
          default:
            return undefined;
        }
      }

      case ShiftDto.LockStatusEnum.Supervised: {

        switch(position.slot.positionSignupState) {
          case PositionSlotDto.PositionSignupStateEnum.SignupPossible:
            return ["REQUEST_SIGN_UP", ...REQUEST_TRADE];
          case PositionSlotDto.PositionSignupStateEnum.SignupViaAuction:
          case PositionSlotDto.PositionSignupStateEnum.SignupViaTrade:
          case PositionSlotDto.PositionSignupStateEnum.SignupOrTrade:
            return ["SIGN_UP", ...REQUEST_TRADE];
          case PositionSlotDto.PositionSignupStateEnum.SignedUp:
            return ["REQUEST_SIGN_OUT"];
          case PositionSlotDto.PositionSignupStateEnum.Full:
            return [...REQUEST_TRADE];
          case PositionSlotDto.PositionSignupStateEnum.NotEligible:
            return ["DISABLED_SIGN_UP"];
          default:
            return undefined;
        }
      }

      default: {
        return undefined;
      }
    }
  }
}
