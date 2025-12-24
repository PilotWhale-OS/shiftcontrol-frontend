import {Component, inject, Input} from "@angular/core";
import {faEye, faFilter} from "@fortawesome/free-solid-svg-icons";
import {InputSelectComponent, SelectOptions} from "../inputs/input-select/input-select.component";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {InputTextComponent} from "../inputs/input-text/input-text.component";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {InputDateComponent} from "../inputs/input-date/input-date.component";
import {InputMultiselectComponent} from "../inputs/input-multiselect/input-multiselect.component";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {NgClass} from "@angular/common";
import {ScheduleStatisticsDto, ShiftPlanScheduleSearchDto} from "../../../shiftservice-client";

export enum ShiftCalendarViewMode {
  Calendar = "calendar",
  Table = "table"
}

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

  @Input()
  public statistics?: ScheduleStatisticsDto;

  @Input()
  public rolesOptions: SelectOptions<string> = [];

  @Input()
  public readonly locationsOptions: SelectOptions<string> = [];

  @Input()
  public readonly tagsOptions: SelectOptions<string> = [];

  public readonly availabilityOptions: SelectOptions<ShiftPlanScheduleSearchDto.ScheduleViewTypeEnum> = [
    {name: "Your Shifts", value: ShiftPlanScheduleSearchDto.ScheduleViewTypeEnum.MyShifts},
    {name: "Signup Possible", value: ShiftPlanScheduleSearchDto.ScheduleViewTypeEnum.SignupPossible}
  ];
  public readonly viewModeOptions: SelectOptions<ShiftCalendarViewMode> = [
    {name: "Calendar", value: ShiftCalendarViewMode.Calendar},
    {name: "Table", value: ShiftCalendarViewMode.Table}
  ];
  public readonly searchForm;
  public readonly viewForm;

  protected showFilters = false;

  protected iconView = faEye;
  protected iconFilter = faFilter;

  private readonly _fb = inject(FormBuilder);

  constructor() {

    /*
    Selecting all filter options does not mean no filtering is applied:
    [ ] -> No filters selected; all values shown
    [ some items ] -> Some filters selected; only matching values shown
    [ all items ] -> All filters selected; only matching values shown
    */

    this.searchForm = this._fb.group({
      shiftName: this._fb.nonNullable.control<string>(""),
      date: this._fb.nonNullable.control<Date>(new Date()),
      rolesList: this._fb.nonNullable.control<string[]>([]),
      locationsList: this._fb.nonNullable.control<string[]>([]),
      tagsList: this._fb.nonNullable.control<string[]>([]),
      availabilityList: this._fb.nonNullable.control<ShiftPlanScheduleSearchDto.ScheduleViewTypeEnum[]>([])
    });
    this.viewForm = this._fb.group({
      viewMode: this._fb.nonNullable.control<ShiftCalendarViewMode>(ShiftCalendarViewMode.Calendar),
    });
  }

}
