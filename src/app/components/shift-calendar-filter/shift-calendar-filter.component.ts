import {Component, inject} from "@angular/core";
import {faEye, faFilter} from "@fortawesome/free-solid-svg-icons";
import {InputSelectComponent, SelectOptions} from "../inputs/input-select/input-select.component";
import {PageService} from "../../services/page/page.service";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {BC_EVENT, BC_PLAN_DASHBOARD} from "../../breadcrumbs";
import {InputTextComponent} from "../inputs/input-text/input-text.component";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {InputDateComponent} from "../inputs/input-date/input-date.component";
import {InputMultiselectComponent} from "../inputs/input-multiselect/input-multiselect.component";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {NgClass} from "@angular/common";

@Component({
  selector: "app-shift-calendar-filter",
  imports: [
    InputTextComponent,
    TypedFormControlDirective,
    ReactiveFormsModule,
    InputDateComponent,
    InputSelectComponent,
    InputMultiselectComponent,
    InputButtonComponent,
    NgClass
  ],
  standalone: true,
  templateUrl: "./shift-calendar-filter.component.html",
  styleUrl: "./shift-calendar-filter.component.scss"
})
export class ShiftCalendarFilterComponent {

  iconView = faEye;
  iconFilter = faFilter;

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

  protected showFilters = false;

  private readonly _pageService = inject(PageService);
  private readonly _fb = inject(FormBuilder);

  constructor() {
    this._pageService
      .configurePageName("Pilot Plan Calendar")
      .configureBreadcrumb(BC_EVENT, "Pilot Event", "eventId")
      .configureBreadcrumb(BC_PLAN_DASHBOARD, "Pilot Plan", "/plans/planId");

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
