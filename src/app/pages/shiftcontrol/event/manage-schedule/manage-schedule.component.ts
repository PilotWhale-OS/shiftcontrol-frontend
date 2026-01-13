import {Component, inject, OnDestroy, viewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {PageService} from "../../../../services/page/page.service";
import {
  AccountInfoDto,
  ActivityDto,
  EventEndpointService,
  LocationDto,
  LocationEndpointService, ShiftColumnDto, ShiftPlanScheduleContentDto
} from "../../../../../shiftservice-client";
import {BC_EVENT} from "../../../../breadcrumbs";
import {ShiftCalendarFilterComponent} from "../../../../components/shift-calendar-filter/shift-calendar-filter.component";
import {calendarConfig, ShiftCalendarGridComponent} from "../../../../components/shift-calendar-grid/shift-calendar-grid.component";
import {
  BehaviorSubject,
  combineLatestWith,
  distinctUntilChanged,
  filter, forkJoin, map,
  of,
  shareReplay,
  startWith, Subject,
  Subscription,
  switchMap,
  withLatestFrom
} from "rxjs";
import {toObservable} from "@angular/core/rxjs-interop";
import {mapValue} from "../../../../util/value-maps";
import {ManageActivityComponent, manageActivityParams} from "../../../../components/manage-activity/manage-activity.component";
import {DialogComponent} from "../../../../components/dialog/dialog.component";
import {AsyncPipe} from "@angular/common";
import {UserService} from "../../../../services/user/user.service";
import UserTypeEnum = AccountInfoDto.UserTypeEnum;

@Component({
  selector: "app-manage-schedule",
  imports: [
    ShiftCalendarFilterComponent,
    ShiftCalendarGridComponent,
    DialogComponent,
    AsyncPipe,
    ManageActivityComponent
  ],
  standalone: true,
  templateUrl: "./manage-schedule.component.html",
  styleUrl: "./manage-schedule.component.scss"
})
export class ManageScheduleComponent implements OnDestroy {
  protected readonly eventId?: string;
  protected selectedActivity$ = new BehaviorSubject<manageActivityParams | undefined>(undefined);
  protected activityChanged$ = new Subject<ActivityDto>();

  private readonly _subscriptions: Subscription[];

  private readonly _shiftPlanSchedule = viewChild(ShiftCalendarGridComponent);
  private readonly _filterComponent = viewChild(ShiftCalendarFilterComponent);

  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _pageService = inject(PageService);
  private readonly _eventService = inject(EventEndpointService);
  private readonly _locationsService = inject(LocationEndpointService);
  private readonly _userService = inject(UserService);

  constructor() {

    const eventId = this._route.snapshot.paramMap.get("eventId") ?? undefined;
    this.eventId = eventId;

    if(eventId === undefined) {
      this._router.navigateByUrl("/");
      throw new Error("Event ID is required");
    }

    this._subscriptions = this.setupWithObservables(eventId);
  }

  public get userType$(){
    return this._userService.userType$;
  }

  ngOnDestroy() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupWithObservables(eventId: string): Subscription[]{
    const subscriptions: Subscription[] = [];

    /* observable based on the event data */
    const event$ = this._eventService.getEventById(eventId).pipe(
      shareReplay()
    );

    /* observable with locations */
    const locations$ = this._locationsService.getAllLocationsForEvent(eventId).pipe(
      shareReplay()
    );

    /* observable based on the filter component view child signal */
    const filterComponent$ = toObservable(this._filterComponent).pipe(
      filter(filterComponent => filterComponent !== undefined),
      shareReplay()
    );

    /* observable based on the calendar view child signal */
    const calendarComponent$ = toObservable(this._shiftPlanSchedule).pipe(
      filter(calendar => calendar !== undefined)
    );

    /* observable containing form view options values */
    const viewOptions$ = filterComponent$.pipe(
      map(component => component?.viewForm ?? undefined),
      startWith(undefined)
    );

    /* observable containing the currently navigated-to date of the calendar */
    const calendarNavigation$ = calendarComponent$.pipe(
      switchMap(calendar => calendar.navigation$),
      distinctUntilChanged((prev, curr) =>
        prev.visibleDates.map(d => d.getTime()).join(",") === curr.visibleDates.map(d => d.getTime()).join(",")
        && prev.cachedDates.map(d => d.getTime()).join(",") === curr.cachedDates.map(d => d.getTime()).join(",")
      )
    );

    /* update page data */
    subscriptions.push(event$.subscribe(event => {
      this._pageService
        .configureBreadcrumb(BC_EVENT, event.name, event.id);
    }));

    /* update calendar layout with event dates and locations */
    subscriptions.push(event$.pipe(
      combineLatestWith(calendarComponent$, locations$),
      withLatestFrom(calendarNavigation$.pipe(
        startWith({visibleDates: [], cachedDates: []})
      ), this._userService.userType$)
    ).subscribe(([[event, calendar, locations], navigation, userType]) => {

      /*
      start date parsed from utc date, begin of day
      */
      const startDate =mapValue.dateStringAsStartOfDayDatetime(event.startTime.split("T")[0]);

      /* end date parsed from utc date, end of day */
      const endDate = mapValue.dateStringAsEndOfDayDatetime(event.endTime.split("T")[0]);

      const config: calendarConfig = {
        startDate,
        endDate,
        locationLayouts: locations.map(location => ({location, requiredShiftColumns: 0})),
        noLocationLayout: {
          requiredShiftColumns: 0
        },
        activityWidth: "15rem",
        hideFilterToggle: false,
        emptySpaceClickCallback: userType === UserTypeEnum.Assigned ? undefined : (date, location) => {
          this.selectedActivity$.next({
            suggestedDate: date,
            suggestedLocation: location,
            eventId,
            activity: undefined,
            availableLocations: locations.map(l => ({name: l.name, value: l.id}))
          });
        },
        activityClickCallback: activity => {
          this.selectedActivity$.next({
            suggestedDate: undefined,
            suggestedLocation: undefined,
            eventId,
            activity,
            availableLocations: locations.map(l => ({name: l.name, value: l.id}))
          });
        }
      };

      const calendarViewInited = navigation.visibleDates.length > 0;
      calendar.setConfig(config);

      if(!calendarViewInited) {
        calendar.jumpToDate(new Date(Math.min(Math.max(startDate.getTime(), new Date().getTime()), endDate.getTime())));
      }
    }));

    /* set date picker to date when changed */
    subscriptions.push(calendarNavigation$.pipe(
      withLatestFrom(viewOptions$)
    ).subscribe(([navigation, viewOptions]) => {
      if(viewOptions === undefined) {
        return;
      }
      const firstDay = [...navigation.visibleDates].shift();
      if(firstDay === undefined) {
        return;
      }

      viewOptions.controls.date.setValue(firstDay);
    }));

    /* subscribe to date picker changes and jump to date in calendar */
    subscriptions.push(viewOptions$.pipe(
      switchMap(view => view ? view.controls.date.valueChanges : of(null)),
      withLatestFrom(calendarNavigation$.pipe(
        map(nav => [...nav.visibleDates].shift()),
        startWith(undefined)
      ), calendarComponent$, calendarComponent$.pipe(
        switchMap(calendar => calendar?.scrolling$ ?? of(false))
      ))
    ).subscribe(([pickerDate, currentDate, calendar, scrolling]) => {
      if(pickerDate === null || currentDate === undefined || scrolling) {
        return;
      }

      if(pickerDate.getTime() !== currentDate.getTime()) {
        calendar.jumpToDate(pickerDate);
      }
    }));

    /* toggle filters when clicked in calendar */
    subscriptions.push(calendarComponent$.pipe(
      switchMap(calendar => calendar.filterToggled$),
      withLatestFrom(toObservable(this._filterComponent))
    ).subscribe(([,filterComponent]) => {
      if(filterComponent !== undefined) {
        filterComponent.showFilters = !filterComponent.showFilters;
      }
    }));

    /* invalidate cached date in calendar */
    subscriptions.push(this.activityChanged$.pipe(
      withLatestFrom(calendarComponent$)
    ).subscribe(([, calendar]) => {
      calendar.clearLoadedDays();
    }));

    /* load schedule when activities updated or navigated date changes */
    subscriptions.push(calendarComponent$.pipe(
      combineLatestWith(calendarNavigation$),
      switchMap(([calendar, navigation]) =>{
        const newDays = navigation.visibleDates.filter(visible =>
          !navigation.cachedDates.some(cached => cached.getTime() === visible.getTime())
        ).map(date => this._eventService.getEventSchedule(eventId, {
            date: mapValue.datetimeToUtcDateString(date)
          }).pipe(

            /* map activities to expected locations column layout */
            map(schedule => {
              const locationMap = new Map<string, ActivityDto[]>();
              const locationIdMap = new Map<string, LocationDto>();
              const activitiesNoLocation: ActivityDto[] = [];

              schedule.activities.forEach(activity => {
                if(activity.location === undefined) {
                  activitiesNoLocation.push(activity);
                  return;
                }

                locationIdMap.set(activity.location.id, activity.location);

                if(!locationMap.has(activity.location.id)) {
                  locationMap.set(activity.location.id, []);
                }
                locationMap.get(activity.location.id)?.push(activity);
              });

              return {
                date: mapValue.datetimeToUtcDateString(date),
                scheduleContentDtos: [...locationIdMap.entries()]
                  .map(([id, location]) => ({
                    location,
                    activities: locationMap.get(id) ?? [],
                    shiftColumns: [] as ShiftColumnDto[]
                  })),
                scheduleContentNoLocationDto: {
                  activities: activitiesNoLocation,
                  shiftColumns: [] as ShiftColumnDto[]
                }
              } as ShiftPlanScheduleContentDto;
            })
          )
        );

        return forkJoin(newDays).pipe(
          map(schedules => ({calendar, schedules}))
        );
      })
    ).subscribe(({calendar, schedules}) => {
      calendar.addScheduleDays(...schedules);
    }));

    return subscriptions;
  }

}
