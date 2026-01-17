import {Component, inject, OnDestroy, viewChild} from "@angular/core";
import {calendarConfig, ShiftCalendarGridComponent} from "../../../components/shift-calendar-grid/shift-calendar-grid.component";
import {ShiftCalendarFilterComponent} from "../../../components/shift-calendar-filter/shift-calendar-filter.component";
import {PageService} from "../../../services/page/page.service";
import {BC_EVENT} from "../../../breadcrumbs";
import {ActivatedRoute, Router} from "@angular/router";
import {
  AccountInfoDto, ActivityDto,
  ActivityEndpointService, EventEndpointService, EventScheduleEndpointService, LocationDto, LocationEndpointService,
  RoleDto, RoleEndpointService,
  ShiftDto
} from "../../../../shiftservice-client";
import {
  BehaviorSubject,
  catchError,
  combineLatestWith,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  forkJoin,
  map,
  of,
  shareReplay,
  startWith, Subject,
  Subscription,
  switchMap,
  withLatestFrom,
} from "rxjs";
import {toObservable} from "@angular/core/rxjs-interop";
import {mapValue} from "../../../util/value-maps";
import {AsyncPipe} from "@angular/common";
import {DialogComponent} from "../../../components/dialog/dialog.component";
import {ManageShiftComponent, manageShiftParams} from "../../../components/manage-shift/manage-shift.component";
import {UserService} from "../../../services/user/user.service";
import UserTypeEnum = AccountInfoDto.UserTypeEnum;
import {SelectOptions} from "../../../components/inputs/input-select/input-select.component";

@Component({
  selector: "app-shift-calendar",
  imports: [
    ShiftCalendarGridComponent,
    ShiftCalendarFilterComponent,
    AsyncPipe,
    DialogComponent,
    ManageShiftComponent
  ],
  standalone: true,
  templateUrl: "./shift-calendar.component.html",
  styleUrl: "./shift-calendar.component.scss"
})
export class ShiftCalendarComponent implements OnDestroy {

  protected selectedShift$ = new BehaviorSubject<manageShiftParams | undefined>(undefined);
  protected shiftChanged$ = new Subject<ShiftDto>();

  private readonly _shiftPlanSchedule = viewChild(ShiftCalendarGridComponent);
  private readonly _filterComponent = viewChild(ShiftCalendarFilterComponent);

  private readonly _subscriptions: Subscription[];

  private readonly _pageService = inject(PageService);
  private readonly _eventScheduleService = inject(EventScheduleEndpointService);
  private readonly _eventService = inject(EventEndpointService);
  private readonly _activityService = inject(ActivityEndpointService);
  private readonly _locationService = inject(LocationEndpointService);
  private readonly _rolesService = inject(RoleEndpointService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _userService = inject(UserService);

  constructor() {
    const eventId = this._route.snapshot.paramMap.get("eventId");
    if(eventId === null) {
      this._router.navigateByUrl("/");
      throw new Error("Event ID is required");
    }

    this._subscriptions = this.setupWithObservables(eventId);
  }

  ngOnDestroy() {
    this._subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  setupWithObservables(eventId: string): Subscription[]{

    /* details about the selected event */
    const event$ = this._eventService.getShiftPlansOverviewOfEvent(eventId).pipe(
      catchError(() => {
        this._router.navigateByUrl("/");
        return EMPTY;
      }),
      shareReplay()
    );

    const isAdmin$ = this._userService.userType$.pipe(
      map(userType => userType === UserTypeEnum.Admin),
      shareReplay()
    );

    /* observable based on the filter component view child signal */
    const filterComponent$ = toObservable(this._filterComponent).pipe(
      filter(filterComponent => filterComponent !== undefined),
      shareReplay()
    );

    /* observable containing form filter values */
    const filters$ = filterComponent$.pipe(
      switchMap(component => component?.searchForm?.valueChanges ?? of(undefined)),
      filter(data => data !== undefined),
      debounceTime(200),
      startWith({} as Partial<ShiftCalendarFilterComponent["searchForm"]["value"]>)
    );

    /* observable containing form view options values */
    const viewOptions$ = filterComponent$.pipe(
      map(component => component?.viewForm ?? undefined),
      startWith(undefined)
    );

    /* observable containing the current calendar layout config */
    const layout$ = filters$.pipe(
      switchMap(filters =>
        this._eventScheduleService.getEventScheduleLayout(eventId, {
          shiftName: mapValue.undefinedIfEmptyString(filters?.shiftName),
          locationIds: filters?.locationsList,
          roleIds: filters?.rolesList,
          shiftRelevances: filters?.relevanceList
        })),
      catchError(() => {
        this._router.navigateByUrl("/");
        return EMPTY;
      }),
      shareReplay()
    );

    /* observable based on the calendar view child signal */
    const calendarComponent$ = toObservable(this._shiftPlanSchedule).pipe(
      filter(calendar => calendar !== undefined)
    );

    /* observable containing the currently navigated-to date of the calendar */
    const calendarNavigation$ = calendarComponent$.pipe(
      switchMap(calendar => calendar.navigation$),
      distinctUntilChanged((prev, curr) =>
        prev.visibleDates.map(d => d.getTime()).join(",") === curr.visibleDates.map(d => d.getTime()).join(",")
        && prev.cachedDates.map(d => d.getTime()).join(",") === curr.cachedDates.map(d => d.getTime()).join(",")
      )
    );

    /* observable containing the filter component configuration */
    const filterData$ = this._eventScheduleService.getEventScheduleFilterValues(eventId).pipe(
      shareReplay()
    );

    const subs: Subscription[] = [];

    /* Update page properties */
    subs.push(event$.subscribe(dashboard => {
      this._pageService
        .configurePageName(`${dashboard.eventOverview.name} Calendar`)
        .configureBreadcrumb(
          BC_EVENT,
          dashboard.eventOverview.name,
          dashboard.eventOverview.id
        );
    }));

    /* clear cache when shift changed */
    subs.push(this.shiftChanged$.pipe(
      withLatestFrom(calendarComponent$)
    ).subscribe(([,calendar]) => {
      calendar.clearLoadedDays();
    }));

    /* set filter values with api data */
    subs.push(filterComponent$.pipe(
      combineLatestWith(filterData$)
    ).subscribe(([filterComponent, filterData]) => {
      filterComponent.rolesOptions = filterData.roles.map(role => ({name: role.name, value: role.id}));
      filterComponent.locationsOptions = filterData.locations.map(location => ({name: location.name, value: location.id}));
    }));

    /* react to calendar config and set in component */
    subs.push(filterData$.pipe(
      combineLatestWith(calendarComponent$, layout$, filterComponent$),
      withLatestFrom(calendarNavigation$.pipe(
        startWith({visibleDates: [], cachedDates: []})
      ), event$, isAdmin$)
    ).subscribe((
      [[filterData, calendar, layout, filterComponent],
        navigation, plan, isAdmin
      ]) => {

      /*
      start date parsed from utc date, begin of day
      */
      const startDate = filterData.firstDate ?
        mapValue.dateStringAsStartOfDayDatetime(filterData.firstDate) : new Date();

      /* end date parsed from utc date, end of day */
      const endDate = filterData.lastDate ?
        mapValue.dateStringAsEndOfDayDatetime(filterData.lastDate) : new Date();

      const availableActivities = [] as SelectOptions<ActivityDto>;
      const availableLocations = [] as SelectOptions<LocationDto>;
      const availableRoles = [] as SelectOptions<RoleDto>;

      const config: calendarConfig = {
        startDate,
        endDate,
        locationLayouts: layout.scheduleLayoutDtos,
        noLocationLayout: {
          requiredShiftColumns: 1
        },
        shiftPaddingColumn: true,
        shiftClickCallback: shift => this.selectedShift$.next({
          shift,
          planId: "",
          eventId: plan.eventOverview.id,
          availableLocations: availableLocations ??
            (shift.location ? [{name: shift.location.name, value: shift.location}] : []),
          availableActivities: availableActivities ??
            (shift.relatedActivity ? [{name: shift.relatedActivity.name, value: shift.relatedActivity}] : []),
          availableRoles: availableRoles ?? shift.positionSlots
            .map(slot => slot.role)
            .filter(role=>role !== undefined)
            .map(role => ({name: role.name, value: role}))
        }),
        emptySpaceClickCallback: !isAdmin ? undefined : (date, location) => this.selectedShift$.next({
          planId: "",
          eventId: plan.eventOverview.id,
          suggestedLocation: location,
          suggestedDate: date,
          availableLocations: availableLocations ?? [],
          availableActivities: availableActivities ?? [],
          availableRoles: availableRoles ?? []
        })
      };
      const calendarViewInited = navigation.visibleDates.length > 0;
      calendar.setConfig(config);

      filterComponent.statistics = layout.scheduleStatistics;

      if(!calendarViewInited) {
        calendar.jumpToDate(new Date(Math.min(Math.max(startDate.getTime(), new Date().getTime()), endDate.getTime())));
      }
    }));

    /* set date picker to date when changed */
    subs.push(calendarNavigation$.pipe(
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
    subs.push(viewOptions$.pipe(
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
    subs.push(calendarComponent$.pipe(
      switchMap(calendar => calendar.filterToggled$),
      withLatestFrom(toObservable(this._filterComponent))
    ).subscribe(([,filterComponent]) => {
      if(filterComponent !== undefined) {
        filterComponent.showFilters = !filterComponent.showFilters;
      }
    }));

    /* load schedule when filter or navigated date changes */
    subs.push(filters$.pipe(
      combineLatestWith(calendarComponent$, filterData$, calendarNavigation$),
      switchMap(([filters, calendar, , navigation]) =>{
        const newDays = navigation.visibleDates.filter(visible =>
          !navigation.cachedDates.some(cached => cached.getTime() === visible.getTime())
        ).map(date => this._eventScheduleService.getEventScheduleContent(eventId, {
            date: mapValue.datetimeToUtcDateString(date),
            shiftName: mapValue.undefinedIfEmptyString(filters?.shiftName),
            locationIds: filters?.locationsList,
            roleIds: filters?.rolesList,
            shiftRelevances: filters?.relevanceList
          })
        );

        return forkJoin(newDays).pipe(
          map(schedules => ({calendar, schedules}))
        );
      })
    ).subscribe(({calendar, schedules}) => {
      calendar.addScheduleDays(...schedules);
    }));

    return subs;
  }
}
