import {Component, Input} from "@angular/core";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {RouterLink} from "@angular/router";
import {faBan, faCalendar, faCheck, faShuffle, faStar} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TooltipDirective} from "../../directives/tooltip.directive";
import {icons} from "../../util/icons";

@Component({
  selector: "app-shift-trade-auction",
  imports: [
    InputButtonComponent,
    RouterLink,
    FaIconComponent,
    TooltipDirective
  ],
  standalone: true,
  templateUrl: "./shift-trade-auction.component.html",
  styleUrl: "./shift-trade-auction.component.scss"
})
export class ShiftTradeAuctionComponent {

  @Input()
  public showShiftOrigin = false;

  protected readonly icons = icons;

  protected readonly iconTrade = faShuffle;
  protected readonly iconEvent = faStar;
  protected readonly iconPlan = faCalendar;
  protected readonly iconKeep = faBan;
  protected readonly iconAccept = faCheck;

}
