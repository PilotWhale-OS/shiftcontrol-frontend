import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {DialogComponent, dialogResult} from "../dialog/dialog.component";
import {InputSelectComponent, SelectOptions} from "../inputs/input-select/input-select.component";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";

@Component({
  selector: "app-dialog-shift-trade",
  imports: [
    DialogComponent,
    InputSelectComponent,
    ReactiveFormsModule,
    TypedFormControlDirective
  ],
  standalone: true,
  templateUrl: "./dialog-shift-trade.component.html",
  styleUrl: "./dialog-shift-trade.component.scss"
})
export class DialogShiftTradeComponent {

  /**
   * event when the dialog should be closed
   */
  @Output()
  public readonly result = new EventEmitter<dialogResult>();

  @Input({required: true})
  public viewWhen?: boolean;

  public readonly form;
  public volunteerOptions: SelectOptions<string> = [
    {name: "User 1", value: "user1"},
    {name: "User 2", value: "user2"}
  ];
  public positionOptions: SelectOptions<string> = [
    {name: "Pilot Shift: Position 1 (22.12.2025 10:00)", value: "pos1"},
    {name: "Pilot Shift 2: Position 2 (22.12.2025 10:00)", value: "pos2"}
  ];
  private readonly _fb = inject(FormBuilder);

  constructor() {
    this.form = this._fb.group({
      volunteer: this._fb.control<string | null>(null),
      position: this._fb.control<string | null>(null)
    });
  }

}
