import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {faBackward, faCircleInfo, faForward, faLocationPin, faTag} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {BehaviorSubject} from "rxjs";
import {DialogComponent} from "../dialog/dialog.component";
import {InputTextComponent} from "../inputs/input-text/input-text.component";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {InputDateComponent} from "../inputs/input-date/input-date.component";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {ActivityDto, ActivityEndpointService, LocationDto} from "../../../shiftservice-client";
import {AsyncPipe} from "@angular/common";
import {InputSelectComponent, SelectOptions} from "../inputs/input-select/input-select.component";
import {InputTimeComponent, time} from "../inputs/input-time/input-time.component";
import {mapValue} from "../../util/value-maps";

export interface manageActivityParams {
  eventId: string;
  activity?: ActivityDto;
  suggestedDate?: Date;
  suggestedLocation?: LocationDto;
  availableLocations: SelectOptions<string>;
}

@Component({
  selector: "app-manage-activity",
  imports: [
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    FaIconComponent,
    InputDateComponent,
    InputButtonComponent,
    DialogComponent,
    AsyncPipe,
    InputSelectComponent,
    InputTimeComponent
  ],
  templateUrl: "./manage-activity.component.html",
  styleUrl: "./manage-activity.component.scss"
})
export class ManageActivityComponent {

  @Output()
  public readonly activityChanged = new EventEmitter<ActivityDto>();

  public readonly form;

  protected readonly iconName = faTag;
  protected readonly iconCaption = faCircleInfo;
  protected readonly iconStartDate = faForward;
  protected readonly iconEndDate = faBackward;
  protected readonly iconLocation = faLocationPin;

  protected readonly manageData$ = new BehaviorSubject<undefined | manageActivityParams>(undefined);

  protected showActivityDeleteConfirm = false;

  private readonly _fb = inject(FormBuilder);
  private readonly _activityService = inject(ActivityEndpointService);

  constructor() {
    this.form = this._fb.group({
      name: this._fb.nonNullable.control<string>("", [Validators.maxLength(30), Validators.required]),
      description: this._fb.nonNullable.control<string>("", [Validators.maxLength(100)]),
      startDate: this._fb.nonNullable.control<Date>(new Date()),
      startTime: this._fb.nonNullable.control<time>({hour: 0, minute: 0}, [Validators.required]),
      endDate: this._fb.nonNullable.control<Date>(new Date()),
      endTime: this._fb.nonNullable.control<time>({hour: 0, minute: 0}, [Validators.required]),
      location: this._fb.control<string | null>(null)
    });
  }

  @Input({required: true})
  public set manageData(value: manageActivityParams) {
    this.manageData$.next(value);

    if(value.activity !== undefined) {
      this.form.setValue({
        name: value.activity.name,
        description: value.activity.description ?? "",
        startDate: new Date(value.activity.startTime),
        startTime: mapValue.datetimeStringAsLocalTime(value.activity.startTime),
        endDate: new Date(value.activity.endTime),
        endTime: mapValue.datetimeStringAsLocalTime(value.activity.endTime),
        location: value.activity.location?.id ?? null
      });
    } else {
      this.form.setValue({
        name: "",
        description: "",
        startDate: value.suggestedDate ?? new Date(),
        startTime: value.suggestedDate ? mapValue.datetimeStringAsLocalTime(value.suggestedDate.toISOString()) : {hour: 10, minute: 0},
        endDate: value.suggestedDate ?? new Date(),
        endTime: value.suggestedDate ?
          mapValue.datetimeStringAsLocalTime(new Date(value.suggestedDate.getTime() + 1000 * 60 * 60 * 2).toISOString()) :
          {hour: 12, minute: 0},
        location: value.suggestedLocation?.id ?? null
      });
    }
  }

  protected create(eventId: string){
    this.form.markAllAsTouched();

    if(this.form.valid) {

      const start = mapValue.combineDateAndLocalTime(this.form.controls.startDate.value, this.form.controls.startTime.value);
      const end = mapValue.combineDateAndLocalTime(this.form.controls.endDate.value, this.form.controls.endTime.value);

      if(start === undefined || end === undefined) {
        throw new Error("Start and end date must be defined");
      }

      this._activityService.createActivity(eventId, {
        name: this.form.controls.name.value,
        description: this.form.controls.description.value,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        locationId: this.form.controls.location.value ?? undefined
      }).subscribe(activity => {
        this.activityChanged.emit(activity);
      });
    }
  }

  protected update(activity: ActivityDto){
    this.form.markAllAsTouched();

    if(this.form.valid) {

      const start = mapValue.combineDateAndLocalTime(this.form.controls.startDate.value, this.form.controls.startTime.value);
      const end = mapValue.combineDateAndLocalTime(this.form.controls.endDate.value, this.form.controls.endTime.value);

      if(start === undefined || end === undefined) {
        throw new Error("Start and end date must be defined");
      }

      this._activityService.updateActivity(activity.id, {
        name: this.form.controls.name.value,
        description: this.form.controls.description.value,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        locationId: this.form.controls.location.value ?? undefined
      }).subscribe(updated => {
        this.activityChanged.emit(updated);
      });
    }
  }

  protected delete(activity: ActivityDto) {
    this._activityService.deleteActivity(activity.id).subscribe(() => {
      this.activityChanged.emit(activity);
    });
  }

}
