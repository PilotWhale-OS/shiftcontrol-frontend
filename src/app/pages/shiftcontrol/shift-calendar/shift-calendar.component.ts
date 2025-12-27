import {Component, effect, inject, signal, viewChild} from "@angular/core";
import {ShiftCalendarGridComponent} from "../../../components/shift-calendar-grid/shift-calendar-grid.component";
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
  tap,
  withLatestFrom
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
      tap(data => console.log("plan$ emitted", data)),
      shareReplay()
    );
    const filters$ = toObservable(this._filterComponent).pipe(
      switchMap(component => component?.searchForm?.valueChanges ?? of(undefined)),
      filter(data => data !== undefined),
      debounceTime(500),
      startWith({} as Partial<ShiftCalendarFilterComponent["searchForm"]["value"]>),
    tap(data => console.log("filters$ emitted", data)),
    );
    const calendar$ = toObservable(this._shiftPlanSchedule).pipe(
      filter(calendar => calendar !== undefined),
      tap(data => console.log("calendar$ emitted", data)),
    );
    const calendarDate$ = calendar$.pipe(
      switchMap(calendar => calendar.navigatedDate$),
      distinctUntilChanged((prev, curr) => prev.getDay() === curr.getDay()),
      tap(data => console.log("calendarDate$ emitted", data)),
    );
    const filterData$ = this._planService.getShiftPlanScheduleFilterValues(planId).pipe(
      shareReplay(),
      tap(data => console.log("filterData$ emitted", data)),
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

    // set calendar bounds
    filterData$.pipe(
      combineLatestWith(calendar$)
    ).subscribe(([filterData, calendar]) => {
      console.log("setting calendar bounds", filterData);
      const startDate = mapValue.datetimeAsLocalDate(filterData.firstDate ? new Date(filterData.firstDate) : new Date());
      const endDate = mapValue.datetimeAsLocalDate(filterData.lastDate ? new Date(filterData.lastDate) : new Date());
      calendar.startDate = startDate;
      calendar.endDate = endDate;

      const initDate = Math.min(Math.max(startDate.getTime(), new Date().getTime()), endDate.getTime());
      calendar.jumpToDate(new Date(initDate));
    });

    // update calendar on changes
    filters$.pipe(
      combineLatestWith(calendar$, filterData$, calendarDate$),
      switchMap(([filters, calendar, , date]) => {
        console.log(mapValue.datetimeAsLocalDate(date));
        return this._planService.getShiftPlanSchedule(planId, {
          date: mapValue.undefinedIfEmptyLocalDate(mapValue.datetimeAsLocalDate(date)),
          shiftName: mapValue.undefinedIfEmptyString(filters?.shiftName),
        }).pipe(
          map(schedule => ({calendar, schedule, date}))
        );
      })
    ).subscribe(({calendar, schedule, date}) => {
      console.log("updating calendar with schedule for date", date, schedule);
      calendar.addScheduleDay(date, schedule);
    });
  }

  setupWithSignals(planId: string){

    /* signal containing the current search form value */
    const filtersSignal =
      signal<Partial<ShiftCalendarFilterComponent["searchForm"]["value"]> | undefined>(undefined);

    /* emit form changes to signal */
    effect((onCleanup)=> {
      const filterComponent = this._filterComponent();
      if(filterComponent === undefined) {
        filtersSignal.set(undefined);
        return;
      }

      const sub = filterComponent.searchForm.valueChanges.pipe(
        debounceTime(500)
      ).subscribe(data => filtersSignal.set(data));
      onCleanup(() => sub.unsubscribe());
    });

    /* signal containing the result of the current dashboard */
    const planSignal = toSignal(
      this._planService.getShiftPlanDashboard(planId).pipe(
        catchError(() => of(null))
      ),
      { initialValue: undefined }
    );

    /* signal containing the result of the available filter data */
    const filterDataSignal = toSignal(
      this._planService.getShiftPlanScheduleFilterValues(planId).pipe(
        catchError(() => of(null))
      ),
      { initialValue: undefined }
    );

    /* update page properties */
    effect(() => {
      const dashboard = planSignal();

      if (dashboard === null) {
        this._router.navigateByUrl("/");
        return;
      }

      if(dashboard !== undefined) {
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
      }
    });

    /* set calendar start date */
    effect(() =>{
      const filterData = filterDataSignal();
      const calendar = this._shiftPlanSchedule();
      if(filterData === undefined || filterData === null || calendar === undefined) {
        return;
      }
      calendar.startDate = filterData.firstDate ? new Date(filterData.firstDate + "T00:00:00") : undefined;
      calendar.endDate = filterData.lastDate ? new Date(filterData.lastDate + "T00:00:00") : undefined;
    });

    /* update calendar on changes */
    effect((onCleanup) => {
      const calendar = this._shiftPlanSchedule();
      const filters = filtersSignal();
      const filterData = filterDataSignal();
      if(calendar === undefined || filterData === undefined || filterData === null) {
        return;
      }

      const sub = this._planService.getShiftPlanSchedule(planId, {
        date: "2025-09-12",  // mapValue.undefinedIfEmptyLocalDate(filters?.date),
        shiftName: mapValue.undefinedIfEmptyString(filters?.shiftName),
      }).subscribe(schedule => {
        /* calendar.schedule = schedule;*/
        calendar.addScheduleDay(new Date(schedule.date ?? ""), schedule);
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

}
