import {Component, Input} from "@angular/core";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {RouterLink} from "@angular/router";
import {faCalendar, faShuffle, faStar} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {AwesomeTooltipDirective} from "../../directives/tooltip.directive";

@Component({
  selector: "app-shift-trade-auction",
  imports: [
    InputButtonComponent,
    RouterLink,
    FaIconComponent,
    AwesomeTooltipDirective
  ],
  standalone: true,
  templateUrl: "./shift-trade-auction.component.html",
  styleUrl: "./shift-trade-auction.component.scss"
})
export class ShiftTradeAuctionComponent {

  @Input()
  public showShiftOrigin = false;

  protected readonly iconTrade = faShuffle;
  protected readonly iconEvent = faStar;
  protected readonly iconPlan = faCalendar;

}
