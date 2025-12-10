import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {DialogComponent, dialogResult} from "../dialog/dialog.component";
import {InputToggleComponent} from "../inputs/input-toggle/input-toggle.component";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";

@Component({
  selector: "app-dialog-shift-auction",
  imports: [
    DialogComponent,
    InputToggleComponent,
    ReactiveFormsModule,
    TypedFormControlDirective
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

  public readonly form;
  private readonly _fb = inject(FormBuilder);

  constructor() {
    this.form = this._fb.group({
      requestRemoval: this._fb.nonNullable.control<boolean>(false)
    });
  }

}
