import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {BehaviorSubject, map} from "rxjs";
import {
  AssignmentDto,
  PositionSlotDto,
  PositionSlotEndpointService,
  ShiftDto
} from "../../../../shiftservice-client";
import {icons} from "../../../util/icons";
import {AsyncPipe} from "@angular/common";
import {InputButtonComponent} from "../../inputs/input-button/input-button.component";
import {ToastService} from "../../../services/toast/toast.service";
import {mapValue} from "../../../util/value-maps";

export interface positionSignupParams {
  slot: PositionSlotDto;
  shift: ShiftDto;
}

@Component({
  selector: "app-position-signup",
  imports: [
    AsyncPipe,
    InputButtonComponent
  ],
  standalone: true,
  templateUrl: "./position-signup.component.html",
  styleUrl: "./position-signup.component.scss"
})
export class PositionSignupComponent {

  @Output()
  public positionSignupChanged = new EventEmitter<AssignmentDto>();

  protected readonly icons = icons;

  protected readonly position$ = new BehaviorSubject<positionSignupParams | undefined>(undefined);
  protected readonly header$ = this.position$.pipe(
    map(position => this.getHeader(position?.slot))
  );
  protected readonly body$ = this.position$.pipe(
    map(position => this.getBody(position))
  );
  protected readonly action$ = this.position$.pipe(
    map(position => this.getAction(position))
  );

  private readonly _positionService = inject(PositionSlotEndpointService);
  private readonly _toastService = inject(ToastService);

  @Input()
  public set positionSlot(value: positionSignupParams | undefined) {
    this.position$.next(value);
  }

  public signUp(slot: PositionSlotDto) {
    this._positionService.joinPositionSlot(slot.id, {
      acceptedRewardPointsConfigHash: slot.rewardPointsDto.rewardPointsConfigHash
    }).pipe(
      this._toastService.tapSuccess("Successfully Signed Up",
        () => `You are now signed up for the position ${slot.name}. You can view your assignments in the shift plan dashboard.`),
      this._toastService.tapError("Could Not Sign Up", mapValue.apiErrorToMessage)
    ).subscribe(data => {
      this.positionSignupChanged.emit(data);
    });
  }

  public signOut(slot: PositionSlotDto) {
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

  private getBody(position: positionSignupParams | undefined): string | undefined {
    if(position === undefined) {
      return undefined;
    }

    switch(position.shift.lockStatus) {

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
            return "Make sure to show up at the shift location at the specified time.";
          default:
            return "INVALID_STATE";
        }
      }

      default: {
        return "Positions are currently locked.";
      }
    }
  }

  private getAction(position: positionSignupParams | undefined):
    "SIGN_UP" | "SIGN_OUT" | "REQUEST_SIGN_UP" | "REQUEST_SIGN_OUT" | undefined {
    if (position === undefined) {
      return undefined;
    }

    switch(position.shift.lockStatus) {

      case ShiftDto.LockStatusEnum.SelfSignup: {

        switch(position.slot.positionSignupState) {
          case PositionSlotDto.PositionSignupStateEnum.SignupPossible:
          case PositionSlotDto.PositionSignupStateEnum.SignupViaTrade:
          case PositionSlotDto.PositionSignupStateEnum.SignupViaAuction:
            return "SIGN_UP";
          case PositionSlotDto.PositionSignupStateEnum.SignupOrTrade:
            return undefined; // TODO what is this
          case PositionSlotDto.PositionSignupStateEnum.SignedUp:
            return "SIGN_OUT";
          default:
            return undefined;
        }
      }

      case ShiftDto.LockStatusEnum.Supervised: {

        switch(position.slot.positionSignupState) {
          case PositionSlotDto.PositionSignupStateEnum.SignupPossible:
            return "REQUEST_SIGN_UP";
          case PositionSlotDto.PositionSignupStateEnum.SignupViaAuction:
          case PositionSlotDto.PositionSignupStateEnum.SignupViaTrade:
            return "SIGN_UP";
          case PositionSlotDto.PositionSignupStateEnum.SignupOrTrade:
            return undefined; // TODO what is this
          case PositionSlotDto.PositionSignupStateEnum.SignedUp:
            return "REQUEST_SIGN_OUT";
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
