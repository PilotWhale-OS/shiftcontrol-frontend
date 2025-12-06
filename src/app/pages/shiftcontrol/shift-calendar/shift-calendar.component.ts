import {Component, inject} from "@angular/core";
import {PageService} from "../../../services/breadcrumbs/page.service";
import {BC_SHIFT_DASHBOARD, BC_SHIFTS} from "../../../breadcrumbs";
import {InputTextComponent} from "../../../components/inputs/input-text/input-text.component";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {TypedFormControlDirective} from "../../../directives/typed-form-control.directive";
import {InputDateComponent} from "../../../components/inputs/input-date/input-date.component";
import {InputSelectComponent, SelectOptions} from "../../../components/inputs/input-select/input-select.component";
import {faEye} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-shift-calendar",
  imports: [
    InputTextComponent,
    TypedFormControlDirective,
    ReactiveFormsModule,
    InputDateComponent,
    InputSelectComponent
  ],
  standalone: true,
  templateUrl: "./shift-calendar.component.html",
  styleUrl: "./shift-calendar.component.scss"
})
export class ShiftCalendarComponent {

  iconView = faEye;

  public readonly viewModeOptions: SelectOptions<"calendar" | "table"> = [
    {name: "Calendar", value: "calendar"},
    {name: "Table", value: "table"}
  ];
  public readonly form;

  private readonly _pageService = inject(PageService);
  private readonly _fb = inject(FormBuilder);

  constructor() {
    this._pageService
      .configureBreadcrumb(BC_SHIFTS, "Pilot Event", "someid")
      .configureBreadcrumb(BC_SHIFT_DASHBOARD, "Pilot Plan", "otherid");

    this.form = this._fb.group({
      shiftName: this._fb.nonNullable.control<string>(""),
      date: this._fb.nonNullable.control<Date>(new Date()),
      viewMode: this._fb.nonNullable.control<"calendar" | "table">("calendar")
    });
  }

}
