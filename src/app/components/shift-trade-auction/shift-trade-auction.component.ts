import {Component, Input} from "@angular/core";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";

@Component({
  selector: "app-shift-trade-auction",
  imports: [
    InputButtonComponent
  ],
  standalone: true,
  templateUrl: "./shift-trade-auction.component.html",
  styleUrl: "./shift-trade-auction.component.scss"
})
export class ShiftTradeAuctionComponent {

  @Input()
  public showShiftOrigin = false;

}
