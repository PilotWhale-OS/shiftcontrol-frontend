import {Component, Input} from "@angular/core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {faCertificate, faGift, faLocationDot, faPeopleGroup} from "@fortawesome/free-solid-svg-icons";
import {TooltipDirective} from "../../directives/tooltip.directive";
import {PositionSlotDto, ShiftDto} from "../../../shiftservice-client";
import {NgClass} from "@angular/common";

@Component({
  selector: "app-shift-details-position",
  imports: [
    FaIconComponent,
    InputButtonComponent,
    TooltipDirective,
    NgClass
  ],
  standalone: true,
  templateUrl: "./shift-details-position.component.html",
  styleUrl: "./shift-details-position.component.scss"
})
export class ShiftDetailsPositionComponent {

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input({required: true, alias: "position"})
  public inputPosition?: PositionSlotDto;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input({required: true, alias: "shift"})
  public inputShift?: ShiftDto;

  @Input({required: true})
  public shiftLocked?: boolean;

  @Input({required: true})
  public tradeAvailable?: boolean;

  @Input({required: true})
  public auctionAvailable?: boolean;

  protected readonly iconStatus = faCertificate;
  protected readonly iconReward = faGift;
  protected readonly iconSlots = faPeopleGroup;
  protected readonly iconLocation = faLocationDot;

  protected readonly PositionSlotDto = PositionSlotDto;

  protected get position(): PositionSlotDto {
    if(this.inputPosition === undefined) {
      throw new Error("Input position required");
    }
    return this.inputPosition;
  }

  protected get shift(): ShiftDto {
    if(this.inputShift === undefined) {
      throw new Error("Input shift required");
    }
    return this.inputShift;
  }

  protected get statusName() {
    switch (this.position.positionSignupState) {
      case PositionSlotDto.PositionSignupStateEnum.SignedUp: return "Signed Up";
      case PositionSlotDto.PositionSignupStateEnum.SignupPossible: return "Sign Up Possible";
      case PositionSlotDto.PositionSignupStateEnum.Full: return "Full";
      case PositionSlotDto.PositionSignupStateEnum.NotEligible: return "Not Eligible";
      default: throw new Error("Unknown signup state");
    }
  }
}
