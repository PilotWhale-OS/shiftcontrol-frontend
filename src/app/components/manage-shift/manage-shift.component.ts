import {Component, EventEmitter, inject, Input, OnDestroy, Output} from "@angular/core";
import {
  ActivityDto,
  ActivityEndpointService,
  LocationDto, PositionSlotDto, RoleDto,
  ShiftDto,
  ShiftEndpointService
} from "../../../shiftservice-client";
import {InputSelectComponent, SelectOptions} from "../inputs/input-select/input-select.component";
import {BehaviorSubject, combineLatestWith, map, of, startWith, Subscription, switchMap, take, tap} from "rxjs";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../services/user/user.service";
import {InputTimeComponent, time} from "../inputs/input-time/input-time.component";
import {mapValue} from "../../util/value-maps";
import {AsyncPipe, DatePipe} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {InputTextComponent} from "../inputs/input-text/input-text.component";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {InputDateComponent} from "../inputs/input-date/input-date.component";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {DialogComponent} from "../dialog/dialog.component";
import {TooltipDirective} from "../../directives/tooltip.directive";
import {ManagePositionComponent, managePositionParams} from "../manage-position/manage-position.component";
import {icons} from "../../util/icons";

export interface manageShiftParams {
  planId: string;
  eventId: string;
  shift?: ShiftDto;
  suggestedDate?: Date;
  suggestedLocation?: LocationDto;
  availableLocations: SelectOptions<LocationDto>;
  availableActivities: SelectOptions<ActivityDto>;
  availableRoles: SelectOptions<RoleDto>;
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
    DialogComponent,
    TooltipDirective,
    ManagePositionComponent
  ],
  providers: [
    DatePipe
  ],
  templateUrl: "./manage-shift.component.html",
  styleUrl: "./manage-shift.component.scss"
})
export class ManageShiftComponent implements OnDestroy {

  @Output()
  public readonly shiftChanged = new EventEmitter<ShiftDto>();

  @Output()
  public readonly navigateOut = new EventEmitter<void>();

  protected readonly form;
  protected readonly icons = icons;

  protected readonly manageData$ = new BehaviorSubject<undefined | manageShiftParams>(undefined);
  protected readonly slotManageData$ = this.manageData$.pipe(
    map(data => {
      if(data === undefined || data.shift === undefined) {
        return [];
      }
      const shift = data.shift;

      const newSlotManageData = this.getSlotManageData(data.shift, data.planId, data.availableRoles, undefined);
      const existingSlotManageData = shift.positionSlots.map(slot =>
        this.getSlotManageData(shift, data.planId, data.availableRoles, slot)
      );
      return [newSlotManageData, ...existingSlotManageData];
    })
  );
  protected readonly suggestedActivities$ = new BehaviorSubject<ActivityDto[]>([]);
  protected readonly requestedEditMode$ = new BehaviorSubject<boolean>(false);

  protected showShiftDeleteConfirm = false;

  private readonly _fb = inject(FormBuilder);
  private readonly _userService = inject(UserService);
  private readonly _shiftService = inject(ShiftEndpointService);
  private readonly _activityService = inject(ActivityEndpointService);
  private readonly _datePipe = inject(DatePipe);

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

  public get mode$(){
    return this.manageData$.pipe(
      combineLatestWith(this.canManage$, this.requestedEditMode$),
      map(([data, canManage, requestedEdit]) => {
        if(data?.shift === undefined && canManage) {
          return "create";
        }
        if(requestedEdit && canManage && data !== undefined) {
          return "edit";
        }
        return "view";
      })
    );
  }

  public get title$(){
    return this.mode$.pipe(
      combineLatestWith(this.manageData$),
      map(([mode, data]) => {
        switch(mode) {
          case "create":
            return "Create Shift";
          case "edit":
            return `${data?.shift?.name ?? ""}`;
          case "view":
            return `${data?.shift?.name ?? ""}`;
        }
        return "";
      })
    );
  }

  public get canManage$() {
    return this.manageData$.pipe(
      switchMap(data => data === undefined ?
        of(false) :
        this._userService.canManagePlan$(data.planId)
      )
    );
  }

  @Input()
  public set manageData(value: manageShiftParams) {
    this.manageData$.next(value);

    this._userService.canManagePlan$(value.planId).pipe(
      switchMap(canManage => canManage ?
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
        }) : of([])
      )
    ).subscribe(suggestions => {
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

  protected refreshShift(shiftId: string){
    this.manageData$.pipe(
      take(1),
      switchMap(data => this._shiftService.getShiftDetails(shiftId).pipe(
        tap(shift => this.shiftChanged.emit(shift.shift)),
        map(shift => ({...data, shift: shift.shift} as manageShiftParams))
      ))
    ).subscribe(params =>this.manageData$.next(params));
  }

  protected linkAndFill(activity: ActivityDto, params: manageShiftParams) {
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

  protected create(planId: string) {
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
        locationId: this.form.controls.activity.value === null ? (this.form.controls.location.value?.id ?? undefined) : undefined,
        activityId: this.form.controls.activity.value?.id ?? undefined
      }).subscribe(shift => {
        this.requestedEditMode$.next(false);
        this.refreshShift(shift.id);
      });
    }
  }

  protected update(shift: ShiftDto) {
    this.form.markAllAsTouched();

    if(this.form.valid) {

      const start = mapValue.combineDateAndLocalTime(this.form.controls.startDate.value, this.form.controls.startTime.value);
      const end = mapValue.combineDateAndLocalTime(this.form.controls.endDate.value, this.form.controls.endTime.value);

      if(start === undefined || end === undefined) {
        throw new Error("Start and end date must be defined");
      }

      this._shiftService.updateShift(shift.id, {
        name: this.form.controls.name.value,
        longDescription: this.form.controls.description.value,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        /* location only if not activity set*/
        locationId: this.form.controls.activity.value === null ? (this.form.controls.location.value?.id ?? undefined) : undefined,
        activityId: this.form.controls.activity.value?.id ?? undefined
      }).subscribe(updatedShift => {
        this.requestedEditMode$.next(false);
        this.refreshShift(updatedShift.id);
      });
    }
  }

  protected delete(shift: ShiftDto) {
    this._shiftService.deleteShift(shift.id).subscribe(() => {
      this.shiftChanged.emit(shift);
      this.navigateOut.emit();
    });
  }

  protected idComparatorFn(a: { id: string } | null, b: { id: string } | null): boolean {
    return a?.id === b?.id || (a === null && b === null);
  }

  protected getDateRange(shift: ShiftDto): string {
    const start = new Date(shift.startTime);
    const end = new Date(shift.endTime);

    return mapValue.dateRangeToDateTimeString(start, end, this._datePipe);
  }

  protected getSlotManageData(shift: ShiftDto, planId: string, availableRoles: SelectOptions<RoleDto>, position?: PositionSlotDto):
    managePositionParams {
    return {
      shift,
      planId,
      availableRoles,
      position
    };
  }

  protected getLockStatusName(shift: ShiftDto): string {
    switch(shift.lockStatus) {
      case ShiftDto.LockStatusEnum.Locked:
        return "Locked Phase";
      case ShiftDto.LockStatusEnum.SelfSignup:
        return "Self Signup Phase";
      case ShiftDto.LockStatusEnum.Supervised:
        return "Supervised Phase";
    }
  }

  protected getLockStatusDescription(shift: ShiftDto): string {
    switch(shift.lockStatus) {
      case ShiftDto.LockStatusEnum.Locked:
        return "Shift sign-ups can no longer be changed.";
      case ShiftDto.LockStatusEnum.SelfSignup:
        return "You can sign-up and withdraw from shifts freely.";
      case ShiftDto.LockStatusEnum.Supervised:
        return "You can only sign-up or withdraw from shifts with approval from a manager or by trading with other volunteers.";
    }
  }
}
