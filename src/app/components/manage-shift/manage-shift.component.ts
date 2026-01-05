import {Component, EventEmitter, inject, Input, OnDestroy, Output} from "@angular/core";
import {
  AccountInfoDto,
  ActivityDto,
  ActivityEndpointService,
  LocationDto,
  ShiftDto,
  ShiftEndpointService
} from "../../../shiftservice-client";
import {InputSelectComponent, SelectOptions} from "../inputs/input-select/input-select.component";
import {BehaviorSubject, map, startWith, Subscription} from "rxjs";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../services/user/user.service";
import {InputTimeComponent, time} from "../inputs/input-time/input-time.component";
import UserTypeEnum = AccountInfoDto.UserTypeEnum;
import {mapValue} from "../../util/value-maps";
import {AsyncPipe} from "@angular/common";
import {faBackward, faCircleInfo, faForward, faLocationPin, faTag} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {InputTextComponent} from "../inputs/input-text/input-text.component";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {InputDateComponent} from "../inputs/input-date/input-date.component";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {DialogComponent} from "../dialog/dialog.component";

export interface manageShiftParams {
  planId: string;
  eventId: string;
  shift?: ShiftDto;
  suggestedDate?: Date;
  suggestedLocation?: LocationDto;
  availableLocations: SelectOptions<LocationDto>;
  availableActivities: SelectOptions<ActivityDto>;
}

@Component({
  selector: "app-manage-shift",
  imports: [
    AsyncPipe,
    FaIconComponent,
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputDateComponent,
    InputTimeComponent,
    InputSelectComponent,
    InputButtonComponent,
    DialogComponent
  ],
  templateUrl: "./manage-shift.component.html",
  styleUrl: "./manage-shift.component.scss"
})
export class ManageShiftComponent implements OnDestroy {

  @Output()
  public readonly shiftChanged = new EventEmitter<ShiftDto>();

  public readonly form;

  protected readonly iconName = faTag;
  protected readonly iconCaption = faCircleInfo;
  protected readonly iconStartDate = faForward;
  protected readonly iconEndDate = faBackward;
  protected readonly iconLocation = faLocationPin;

  protected readonly manageData$ = new BehaviorSubject<undefined | manageShiftParams>(undefined);
  protected readonly suggestedActivities$ = new BehaviorSubject<ActivityDto[]>([]);

  protected showShiftDeleteConfirm = false;

  private readonly _fb = inject(FormBuilder);
  private readonly _userService = inject(UserService);
  private readonly _shiftService = inject(ShiftEndpointService);
  private readonly _activityService = inject(ActivityEndpointService);

  private readonly _disableLocationSubscription: Subscription;

  constructor() {
    this.form = this._fb.group({
      name: this._fb.nonNullable.control<string>("", [Validators.maxLength(50), Validators.required]),
      description: this._fb.nonNullable.control<string>("", [Validators.maxLength(1024)]),
      startDate: this._fb.nonNullable.control<Date>(new Date()),
      startTime: this._fb.nonNullable.control<time>({hour: 0, minute: 0}, [Validators.required]),
      endDate: this._fb.nonNullable.control<Date>(new Date()),
      endTime: this._fb.nonNullable.control<time>({hour: 0, minute: 0}, [Validators.required]),
      location: this._fb.control<LocationDto | null>(null),
      activity: this._fb.control<ActivityDto | null>(null)
    });

    this._disableLocationSubscription = this.form.controls.activity.valueChanges.pipe(
      startWith(this.form.controls.activity.value)
    ).subscribe(activityId => {
      const locationIsEnabled = this.form.controls.location.enabled;

      if (activityId !== null && locationIsEnabled) {
        this.form.controls.location.disable();
      } else if (activityId === null && !locationIsEnabled) {
        this.form.controls.location.enable();
      }
    });
  }

  public get canManage$() {
    return this._userService.userType$.pipe(
      map(userType => userType === UserTypeEnum.Admin)
    );
  }

  @Input()
  public set manageData(value: manageShiftParams) {
    this.manageData$.next(value);

    this._activityService.suggestActivitiesForShift(value.eventId, {
      timeFilter: value.shift !== undefined ? {
        startTime: value.shift?.startTime,
        endTime: value.shift?.endTime,
        toleranceInMinutes: 60 * 5
      } : value.suggestedDate ? {
        startTime: new Date(value.suggestedDate.getTime()).toISOString(),
        endTime: new Date(value.suggestedDate.getTime() + 1000 * 60 * 60 * 3).toISOString(),
        toleranceInMinutes: 60 * 5
      } : undefined
    }).subscribe(suggestions => {
      this.suggestedActivities$.next(suggestions);
    });

    if (value.shift) {
      this.form.setValue({
        name: value.shift.name,
        description: value.shift.longDescription ?? "",
        startDate: new Date(value.shift.startTime),
        startTime: mapValue.datetimeStringAsLocalTime(value.shift.startTime),
        endDate: new Date(value.shift.endTime),
        endTime: mapValue.datetimeStringAsLocalTime(value.shift.endTime),
        location: value.shift.location ?? null,
        activity: value.shift.relatedActivity ?? null
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
        location: value.suggestedLocation ?? null,
        activity: null
      });
    }
  }

  ngOnDestroy() {
    this._disableLocationSubscription.unsubscribe();
  }

  linkAndFill(activity: ActivityDto, params: manageShiftParams) {
    const matchingActivity = params.availableActivities
      .find(o => o.value.id === activity.id);
    this.form.controls.activity.setValue(matchingActivity?.value ?? null);
    const matchingLocation = params.availableLocations
      .find(o => o.value.id === activity.location?.id);
    this.form.controls.location.setValue(matchingLocation?.value ?? null);

    if(matchingActivity !== undefined) {
      this.form.controls.startTime.setValue(mapValue.datetimeStringAsLocalTime(activity.startTime));
      this.form.controls.startDate.setValue(new Date(activity.startTime));
      this.form.controls.endTime.setValue(mapValue.datetimeStringAsLocalTime(activity.endTime));
      this.form.controls.endDate.setValue(new Date(activity.endTime));

      this.form.controls.description.setValue(`Shift for activity: ${activity.name}`);
    }
  }

  public create(planId: string) {
    this.form.markAllAsTouched();

    if(this.form.valid) {

      const start = mapValue.combineDateAndLocalTime(this.form.controls.startDate.value, this.form.controls.startTime.value);
      const end = mapValue.combineDateAndLocalTime(this.form.controls.endDate.value, this.form.controls.endTime.value);

      if(start === undefined || end === undefined) {
        throw new Error("Start and end date must be defined");
      }

      this._shiftService.createShift(planId, {
        name: this.form.controls.name.value,
        longDescription: this.form.controls.description.value,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        /* location only if not activity set*/
        locationId: this.form.controls.activity.value === undefined ? (this.form.controls.location.value?.id ?? undefined) : undefined,
        activityId: this.form.controls.activity.value?.id ?? undefined
      }).subscribe(shift => {
        this.shiftChanged.emit(shift);
      });
    }

  }

  public update(shift: ShiftDto) {

  }

  public delete(shift: ShiftDto) {
    this._shiftService.deleteShift(shift.id).subscribe(() => {
      this.shiftChanged.emit(shift);
    });
  }

  protected idComparatorFn(a: { id: string } | null, b: { id: string } | null): boolean {
    return a?.id === b?.id || (a === null && b === null);
  }
}
