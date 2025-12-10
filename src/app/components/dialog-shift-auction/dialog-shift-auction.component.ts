import {Component, EventEmitter, Input, Output} from "@angular/core";
import {DialogComponent, dialogResult} from "../dialog/dialog.component";

@Component({
  selector: "app-dialog-shift-auction",
  imports: [
    DialogComponent
  ],
  standalone: true,
  templateUrl: "./dialog-shift-auction.component.html",
  styleUrl: "./dialog-shift-auction.component.scss"
})
export class DialogShiftAuctionComponent {

  /**
   * event when the dialog should be closed
   */
  @Output()
  public readonly result = new EventEmitter<dialogResult>();

  @Input({required: true})
  public viewWhen?: boolean;

}
