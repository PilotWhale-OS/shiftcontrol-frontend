import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {DialogComponent, dialogResult} from "../dialog/dialog.component";
import {InputToggleComponent} from "../inputs/input-toggle/input-toggle.component";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {InputDateComponent} from "../inputs/input-date/input-date.component";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";

@Component({
  selector: "app-dialog-add-unavailability",
  imports: [
    DialogComponent,
    InputToggleComponent,
    InputButtonComponent,
    InputDateComponent,
    TypedFormControlDirective,
    ReactiveFormsModule
  ],
  standalone: true,
  templateUrl: "./dialog-add-unavailability.component.html",
  styleUrl: "./dialog-add-unavailability.component.scss"
})
export class DialogAddUnavailabilityComponent {

  /**
   * event when the dialog should be closed
   */
  @Output()
  public readonly result = new EventEmitter<dialogResult>();

  @Input({required: true})
  public viewWhen?: boolean;

  public readonly form;
  private readonly _fb = inject(FormBuilder);

  constructor(){
    this.form = this._fb.group({
      unavailabilityFromEventStart: this._fb.nonNullable.control<boolean>(false),
      unavailabilityUntilEventEnd: this._fb.nonNullable.control<boolean>(false),
      unavailabilityFrom: this._fb.nonNullable.control<Date>(new Date()),
      unavailabilityUntil: this._fb.nonNullable.control<Date>(new Date()),
    });
  }
}
