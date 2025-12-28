import {Component, effect, inject, signal, viewChild} from "@angular/core";
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
  filter,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap
} from "rxjs";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
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
export class ShiftCalendarComponent {

  private readonly _shiftPlanSchedule = viewChild(ShiftCalendarGridComponent);
  private readonly _filterComponent = viewChild(ShiftCalendarFilterComponent);

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

    this.setupWithObservables(shiftPlanId);
  }

  setupWithObservables(planId: string){
    const plan$ = this._planService.getShiftPlanDashboard(planId).pipe(
      catchError(() => {
        this._router.navigateByUrl("/");
        return EMPTY;
      }),
      shareReplay()
    );
    const filters$ = toObservable(this._filterComponent).pipe(
      switchMap(component => component?.searchForm?.valueChanges ?? of(undefined)),
      filter(data => data !== undefined),
      debounceTime(500),
      startWith({} as Partial<ShiftCalendarFilterComponent["searchForm"]["value"]>)
    );
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
    const calendar$ = toObservable(this._shiftPlanSchedule).pipe(
      filter(calendar => calendar !== undefined)
    );
    const calendarDate$ = calendar$.pipe(
      switchMap(calendar => calendar.navigatedDate$),
      distinctUntilChanged((prev, curr) => prev.getDay() === curr.getDay())
    );
    const filterData$ = this._planService.getShiftPlanScheduleFilterValues(planId).pipe(
      shareReplay()
    );

    // Update page properties
    plan$.subscribe(dashboard => {
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
    });

    // set calendar config
    filterData$.pipe(
      combineLatestWith(calendar$, layout$),
    ).subscribe(([filterData, calendar, layout]) => {
      const startDate = mapValue.datetimeAsLocalDate(filterData.firstDate ? new Date(filterData.firstDate) : new Date());
      const endDate = mapValue.datetimeAsLocalDate(filterData.lastDate ? new Date(filterData.lastDate) : new Date());
      const config: calendarConfig = {
        startDate,
        endDate,
        initDate: new Date(Math.min(Math.max(startDate.getTime(), new Date().getTime()), endDate.getTime())),
        locationLayouts: layout.scheduleLayoutDtos
      };
      calendar.setConfig(config);
    });

    // update calendar on changes
    filters$.pipe(
      combineLatestWith(calendar$, filterData$, calendarDate$),
      switchMap(([filters, calendar, , date]) =>
        this._planService.getShiftPlanScheduleContent(planId, {
          date: mapValue.localDateAsString(mapValue.datetimeAsLocalDate(date)),
          shiftName: mapValue.undefinedIfEmptyString(filters?.shiftName),
        }).pipe(
          map(schedule => ({calendar, schedule}))
        ))
    ).subscribe(({calendar, schedule}) => {
      console.log("updating calendar with schedule for date", schedule, schedule.date);
      calendar.addScheduleDay(schedule);
    });
  }
}
