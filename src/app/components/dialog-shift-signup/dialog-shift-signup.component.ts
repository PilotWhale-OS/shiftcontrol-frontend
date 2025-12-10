import {Component, EventEmitter, Input, Output} from "@angular/core";
import {DialogComponent, dialogResult} from "../dialog/dialog.component";

@Component({
  selector: "app-dialog-shift-signup",
  imports: [
    DialogComponent
  ],
  templateUrl: "./dialog-shift-signup.component.html",
  styleUrl: "./dialog-shift-signup.component.scss"
})
export class DialogShiftSignupComponent {

  /**
   * event when the dialog should be closed
   */
  @Output()
  public readonly result = new EventEmitter<dialogResult>();

  @Input({required: true})
  public viewWhen?: boolean;

}
