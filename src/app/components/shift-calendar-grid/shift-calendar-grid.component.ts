import {Component, ElementRef, inject, viewChild} from "@angular/core";
import {DialogComponent} from "../dialog/dialog.component";
import {ShiftDetailsViewComponent} from "../shift-details-view/shift-details-view.component";
import {DialogService} from "../../services/dialog/dialog.service";
import {faLocationDot} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {
  ActivityDto,
  PositionSlotDto,
  ScheduleLayoutDto,
  ShiftColumnDto,
  ShiftDto,
  ShiftPlanScheduleContentDto
} from "../../../shiftservice-client";
import {AsyncPipe, DatePipe, NgClass} from "@angular/common";
import {BehaviorSubject, combineLatestWith, debounceTime, filter, map, Observable, shareReplay, Subject, withLatestFrom} from "rxjs";
import {toObservable} from "@angular/core/rxjs-interop";

export interface calendarConfig {
  startDate: Date;
  endDate: Date;
  initDate: Date;
  locationLayouts: ScheduleLayoutDto[];
}

@Component({
  selector: "app-shift-calendar-grid",
  imports: [
    DialogComponent,
    ShiftDetailsViewComponent,
    FaIconComponent,
    DatePipe,
    NgClass,
    AsyncPipe
  ],
  standalone: true,
  templateUrl: "./shift-calendar-grid.component.html",
  styleUrl: "./shift-calendar-grid.component.scss"
})
export class ShiftCalendarGridComponent {

  public readonly navigatedDate$: Observable<Date>;

  protected viewShift = false;
  protected readonly iconLocation = faLocationDot;
  protected readonly scrolled$ = new Subject<Event>();

  /**
   * The lazily loaded schedule days mapped by date string
   * @protected
   */
  protected readonly loadedDays$ = new BehaviorSubject<Map<string, ShiftPlanScheduleContentDto>>(new Map());

  /**
   * The calendar configuration (externally) based on current filters
   * @protected
   */
  protected readonly config$ = new BehaviorSubject<calendarConfig | undefined>(undefined);

  /**
   * The list of shifts and activities across all loaded days,
   * duplicates removed, joined with their locations
   * @protected
   */
  protected readonly schedule$ = this.loadedDays$.pipe(
    map(dayMap => dayMap.size > 0 ? [...dayMap.values()] : []),
    map(days => {
      const activities = days
        .flatMap(day => day.scheduleContentDtos)
        .flatMap(schedule => schedule.activities.map(activity => ({
          activity,
          location: schedule.location
        })));
      const activityMap = new Map(activities.map(activityItem => [activityItem.activity.id, activityItem]));

      const shifts = days
        .flatMap(day => day.scheduleContentDtos)
        .flatMap(schedule => schedule.shiftColumns.map(shift => ({
          shift,
          location: schedule.location
        })));
      const shiftMap = new Map(shifts.map(shiftItem => [shiftItem.shift.shiftDto.id, shiftItem]));

      return {
        activities: [...activityMap.values()],
        shifts: [...shiftMap.values()]
      };
    }),
    shareReplay()
  );

  private readonly activityWidth = "2rem";
  private readonly shiftWidth = "10rem";
  private readonly venueGapWidth = "1rem";
  private readonly minuteHeightRem = 0.05;

  private readonly _calendarParent = viewChild<ElementRef<HTMLButtonElement>>("calendarParent");
  private readonly _navigatedDate$ = new Subject<Date>();
  private readonly _jumpDate$ = new Subject<Date>();
  private readonly _dialogService = inject(DialogService);

  constructor() {
    this.navigatedDate$ = this._navigatedDate$.asObservable();

    /* calculate the currently navigated day based on scroll position */
    this.scrolled$.pipe(
      debounceTime(10),
      withLatestFrom(this.config$),
      map(([event, config]) => {
        if (config === undefined) {
          return undefined;
        }

        const target = event.target as HTMLElement;
        const scrollPercent = target.scrollTop / target.scrollHeight;
        const scrollTime = (config.endDate.getTime() - config.startDate.getTime() + 24 * 60 * 60 * 1000) * scrollPercent; // inclusive end
        const scrolledDate = config.startDate.getTime() + scrollTime;
        return new Date(scrolledDate);
      }),
      filter(date => date !== undefined)
    ).subscribe(date => {
      this._navigatedDate$.next(date as Date);
    });

    /* jump to date when requested by changing the scroll position of the container */
    this._jumpDate$.pipe(
      combineLatestWith(toObservable(this._calendarParent).pipe(
        map((parent => parent?.nativeElement as HTMLElement))
      )),
      filter(([, parent]) => parent !== undefined),
      withLatestFrom(this.config$),
    ).subscribe(([[date, parent], config]) => {
      this._navigatedDate$.next(date);

      if(config === undefined) {
        throw new Error("startDate and endDate inputs are required to jump to date");
      }

      const totalMinutes = (config.endDate.getTime() - config.startDate.getTime()) / (1000 * 60) + 1440; // inclusive end
      const targetMinutes = (date.getTime() - config.startDate.getTime()) / (1000 * 60);
      const scrollPercent = targetMinutes / totalMinutes;
      setTimeout(() => parent.scrollTo(parent.scrollHeight * scrollPercent, parent.scrollHeight),10); // TODO fix? some timing issue?
    });
  }

  public addScheduleDay(schedule: ShiftPlanScheduleContentDto) {
    const currentMap = this.loadedDays$.getValue();
    currentMap.set(schedule.date, schedule);
    this.loadedDays$.next(currentMap);
  }

  /**
   * Set the calendar configuration,
   * clearing any previously loaded days
   * @param config
   */
  public setConfig(config: calendarConfig) {
    this.loadedDays$.next(new Map());
    this.config$.next(config);
    this._jumpDate$.next(config.initDate);
  }

  /**
   * Generate the list of hours to display based on the calendar config
   * @param config
   * @protected
   */
  protected getHours(config: calendarConfig) {
    const totalHours = Math.ceil(
      (config.endDate.getTime() - (config.startDate.getTime())) / (1000 * 60 * 60)
    ) + 24; // since end is inclusive
    return Array.from({length: totalHours}, (_, i) => i);
  }

  /**
   * Get the CSS height for a duration in minutes
   * @param durationMinutes
   * @protected
   */
  protected getMinuteHeight(durationMinutes: number) {
    return `${durationMinutes * this.minuteHeightRem}rem`;
  }

  /**
   * Get the Date object for a given hour index based on the calendar config
   * @param hourIndex
   * @param config
   * @protected
   */
  protected getDayOfHour(hourIndex: number, config: calendarConfig) {
    return new Date(config.startDate.getTime() + hourIndex * 60 * 60 * 1000);
  }

  /**
   * Generate a grid layout based on the calendar (layout) config,
   * containing locations and shift columns consistent across all days
   * @param config
   * @protected
   */
  protected getGridColumns(config: calendarConfig){

    return `[time-start] 5rem [time-end ${
      (config.locationLayouts ?? []).sort((a,b) => {
        const aId = a.location.id.toLowerCase();
        const bId = b.location.id.toLowerCase();
        if(aId < bId) {
          return -1;
        }
        if(aId > bId) {
          return 1;
        }
        return 0;
      }).map(locationColumn => {
        const locationName = locationColumn.location.id;
        return `venue-${locationName}-start venue-${locationName}-activity-start] ${
          this.activityWidth
        } [venue-${locationName}-activity-end venue-${locationName}-shift-start ${
          Array(locationColumn.requiredShiftColumns).fill(undefined).map((_, index) =>
            `venue-${locationName}-shift-col-${index + 1}-start] ${
              this.shiftWidth
            } [venue-${locationName}-shift-col-${index + 1}-end`).join(" ")
        } venue-${locationName}-shift-end venue-${locationName}-end venue-${locationName}-gap-start] ${
          this.venueGapWidth
        } [venue-${locationName}-gap-end`;
      }).join(" ")
    } blank-start] 1fr [blank-end]`;
  }

  /**
   * Get the duration of a shift in minutes
   * @param shift
   * @protected
   */
  protected getItemMinutesDuration(shift: ShiftDto | ActivityDto){
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime);
      const durationMs = end.getTime() - start.getTime();
      return Math.floor(durationMs / 60000); // convert ms to minutes
  }

  /**
   * Get the minutes from the start of the calendar day to the shift start time
   * @param shift
   * @param config
   * @protected
   */
  protected getItemMinutesFromStart(shift: ShiftDto | ActivityDto, config: calendarConfig) {
    const shiftStart = new Date(shift.startTime);
    const durationMs = shiftStart.getTime() - config.startDate.getTime();
    return Math.floor(durationMs / 60000); // convert ms to minutes
  }

  /**
   * Get the display/color category for a shift based on signup state
   * @param shift
   * @protected
   */
  protected getShiftDisplayCategory(shift: ShiftDto): "eligible" | "signed-up" | undefined {
    if(shift.positionSlots.some(slot => slot.positionSignupState ===  PositionSlotDto.PositionSignupStateEnum.SignedUp)){
      return "signed-up";
    }
    if(shift.positionSlots.some(slot =>
      slot.positionSignupState ===  PositionSlotDto.PositionSignupStateEnum.SignupViaAuction ||
      slot.positionSignupState ===  PositionSlotDto.PositionSignupStateEnum.SignupViaTrade
    )){
      return "eligible";
    }

    return undefined;
  }

  /**
   * Get the caption/tag for a shift based on signup state
   * @param shift
   * @protected
   */
  protected getShiftDisplayTag(shift: ShiftDto): string {
    if(shift.positionSlots.some(slot => slot.positionSignupState ===  PositionSlotDto.PositionSignupStateEnum.SignedUp)){
      return "Signed Up";
    }
    if(shift.positionSlots.some(slot =>
      slot.positionSignupState ===  PositionSlotDto.PositionSignupStateEnum.SignupViaAuction ||
      slot.positionSignupState ===  PositionSlotDto.PositionSignupStateEnum.SignupViaTrade
    )){
      return "Eligible";
    }

    return "";
  }
}
