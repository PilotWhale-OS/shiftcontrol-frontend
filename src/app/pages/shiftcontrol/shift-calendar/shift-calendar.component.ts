import {Component, inject} from "@angular/core";
import {PageService} from "../../../services/breadcrumbs/page.service";
import {BC_SHIFT_DASHBOARD, BC_SHIFTS} from "../../../breadcrumbs";
import {InputTextComponent} from "../../../components/inputs/input-text/input-text.component";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {TypedFormControlDirective} from "../../../directives/typed-form-control.directive";
import {InputDateComponent} from "../../../components/inputs/input-date/input-date.component";
import {InputSelectComponent, SelectOptions} from "../../../components/inputs/input-select/input-select.component";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {InputMultiselectComponent} from "../../../components/inputs/input-multiselect/input-multiselect.component";
import {ShiftCalendarGridComponent} from "../../../components/shift-calendar/shift-calendar-grid.component";

@Component({
  selector: "app-shift-calendar",
  imports: [
    InputTextComponent,
    TypedFormControlDirective,
    ReactiveFormsModule,
    InputDateComponent,
    InputSelectComponent,
    InputMultiselectComponent,
    ShiftCalendarGridComponent
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
  public readonly rolesOptions: SelectOptions<string> = [
    {name: "ID Checker", value: "idcheck"},
    {name: "Light Technician", value: "lighttech"},
    {name: "Sound Technician", value: "soundtech"}
  ];
  public readonly locationsOptions: SelectOptions<string> = [
    {name: "Venue A", value: "va"},
    {name: "Venue B", value: "vb"},
    {name: "Outdoor", value: "od"}
  ];
  public readonly tagsOptions: SelectOptions<string> = [
    {name: "Guard", value: "guard"},
    {name: "Management", value: "mgm"},
    {name: "Catering", value: "cat"}
  ];
  public readonly availabilityOptions: SelectOptions<"unassigned" | "assigned" | "own" | "auction" | "trade"> = [
    {name: "Unassigned", value: "unassigned"},
    {name: "Assigned", value: "assigned"},
    {name: "Own Shifts", value: "own"},
    {name: "Auctioned", value: "auction"},
    {name: "Trade", value: "trade"}
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
      viewMode: this._fb.nonNullable.control<"calendar" | "table">("calendar"),
      rolesList: this._fb.nonNullable.control<string[]>(this.rolesOptions.map((role) => role.value)),
      locationsList: this._fb.nonNullable.control<string[]>(this.locationsOptions.map((location) => location.value)),
      tagsList: this._fb.nonNullable.control<string[]>(this.tagsOptions.map((tag) => tag.value)),
      availabilityList: this._fb.nonNullable.control<("unassigned" | "assigned" | "own" | "auction" | "trade")[]>(
        this.availabilityOptions.map((availability) => availability.value)
      )
    });
  }

}
