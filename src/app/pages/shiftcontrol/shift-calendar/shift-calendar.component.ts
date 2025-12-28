import {Component, inject, OnDestroy, viewChild} from "@angular/core";
import {calendarConfig, ShiftCalendarGridComponent} from "../../../components/shift-calendar-grid/shift-calendar-grid.component";
import {ShiftCalendarFilterComponent} from "../../../components/shift-calendar-filter/shift-calendar-filter.component";
import {PageService} from "../../../services/page/page.service";
import {BC_EVENT, BC_PLAN_DASHBOARD} from "../../../breadcrumbs";
import {ActivatedRoute, Router} from "@angular/router";
import {ShiftPlanEndpointService} from "../../../../shiftservice-client";
import {
  catchError,
  combineLatestWith,
  debounceTime, distinctUntilChanged,
  EMPTY,
  filter, forkJoin,
  map,
  of,
  shareReplay,
  startWith, Subscription,
  switchMap
} from "rxjs";
import {toObservable} from "@angular/core/rxjs-interop";
import {mapValue} from "../../../util/value-maps";

@Component({
  selector: "app-shift-calendar",
  imports: [
    ShiftCalendarGridComponent,
    ShiftCalendarFilterComponent
  ],
  standalone: true,
  templateUrl: "./shift-calendar.component.html",
  styleUrl: "./shift-calendar.component.scss"
})
export class ShiftCalendarComponent implements OnDestroy {

  private readonly _shiftPlanSchedule = viewChild(ShiftCalendarGridComponent);
  private readonly _filterComponent = viewChild(ShiftCalendarFilterComponent);

  private readonly _subscriptions: Subscription[];

  private readonly _pageService = inject(PageService);
  private readonly _planService = inject(ShiftPlanEndpointService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  constructor() {
    const shiftPlanId = this._route.snapshot.paramMap.get("shiftPlanId");
    if(shiftPlanId === null) {
      this._router.navigateByUrl("/");
      throw new Error("Shift Plan ID is required");
    }

    this._subscriptions = this.setupWithObservables(shiftPlanId);
  }

  ngOnDestroy() {
    this._subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  setupWithObservables(planId: string): Subscription[]{

    /* details about the selected shift plan */
    const plan$ = this._planService.getShiftPlanDashboard(planId).pipe(
      catchError(() => {
        this._router.navigateByUrl("/");
        return EMPTY;
      }),
      shareReplay()
    );

    /* observable containing form filter values */
    const filters$ = toObservable(this._filterComponent).pipe(
      switchMap(component => component?.searchForm?.valueChanges ?? of(undefined)),
      filter(data => data !== undefined),
      debounceTime(500),
      startWith({} as Partial<ShiftCalendarFilterComponent["searchForm"]["value"]>)
    );

    /* observable containing the current calendar layout config */
    const layout$ = filters$.pipe(
      switchMap(filters =>
        this._planService.getShiftPlanScheduleLayout(planId, {
          shiftName: mapValue.undefinedIfEmptyString(filters?.shiftName)
        })),
      catchError(() => {
        this._router.navigateByUrl("/");
        return EMPTY;
      }),
      shareReplay()
    );

    /* observable based on the calendar view child signal */
    const calendar$ = toObservable(this._shiftPlanSchedule).pipe(
      filter(calendar => calendar !== undefined)
    );

    /* observable containing the currently navigated-to date of the calendar */
    const calendarNavigation$ = calendar$.pipe(
      switchMap(calendar => calendar.navigation$),
      distinctUntilChanged((prev, curr) =>
        prev.visibleDates.map(d => d.getDay()).join(",") === curr.visibleDates.map(d => d.getDay()).join(",")
      )
    );

    /* observable containing the filter component configuration */
    const filterData$ = this._planService.getShiftPlanScheduleFilterValues(planId).pipe(
      shareReplay()
    );

    const subs: Subscription[] = [];

    /* Update page properties */
    subs.push(plan$.subscribe(dashboard => {
      this._pageService
        .configurePageName(`${dashboard.shiftPlan.name} Calendar`)
        .configureBreadcrumb(
          BC_EVENT,
          dashboard.eventOverview.name,
          dashboard.eventOverview.id
        )
        .configureBreadcrumb(
          BC_PLAN_DASHBOARD,
          dashboard.shiftPlan.name,
          `/plans/${dashboard.shiftPlan.id}`
        );
    }));

    /* react to calendar config and set in component */
    subs.push(filterData$.pipe(
      combineLatestWith(calendar$, layout$),
    ).subscribe(([filterData, calendar, layout]) => {
      const startDate = mapValue.datetimeAsLocalDate(filterData.firstDate ? new Date(filterData.firstDate) : new Date());
      const endDate = mapValue.datetimeAsLocalDate(filterData.lastDate ? new Date(filterData.lastDate) : new Date());
      const config: calendarConfig = {
        startDate,
        endDate,
        locationLayouts: layout.scheduleLayoutDtos
      };
      calendar.setConfig(config);
      calendar.jumpToDate(new Date(Math.min(Math.max(startDate.getTime(), new Date().getTime()), endDate.getTime())));
    }));

    /* load schedule when filter or navigated date changes */
    subs.push(filters$.pipe(
      combineLatestWith(calendar$, filterData$, calendarNavigation$),
      switchMap(([filters, calendar, , navigation]) =>{

        const newDays = navigation.visibleDates.filter(visible =>
          !navigation.cachedDates.some(cached => cached.getTime() === visible.getTime())
        ).map(date => this._planService.getShiftPlanScheduleContent(planId, {
            date: mapValue.localDateAsString(mapValue.datetimeAsLocalDate(date)),
            shiftName: mapValue.undefinedIfEmptyString(filters?.shiftName),
          })
        );

        return forkJoin(newDays).pipe(
          map(schedules => ({calendar, schedules}))
        );
      })
    ).subscribe(({calendar, schedules}) => {
      console.log("updating calendar with new schedule for dates", schedules);
      for(const schedule of schedules) {
        calendar.addScheduleDay(schedule);
      }
    }));

    return subs;
  }
}
