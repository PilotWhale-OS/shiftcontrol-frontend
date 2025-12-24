import {Component, effect, inject, signal, viewChild} from "@angular/core";
import {ShiftCalendarGridComponent} from "../../../components/shift-calendar-grid/shift-calendar-grid.component";
import {ShiftCalendarFilterComponent} from "../../../components/shift-calendar-filter/shift-calendar-filter.component";
import {PageService} from "../../../services/page/page.service";
import {BC_EVENT, BC_PLAN_DASHBOARD} from "../../../breadcrumbs";
import {ActivatedRoute, Router} from "@angular/router";
import {ShiftPlanEndpointService} from "../../../../shiftservice-client";
import {catchError, debounceTime, of} from "rxjs";
import {toSignal} from "@angular/core/rxjs-interop";
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

    this.setupWithSignals(shiftPlanId);
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
      calendar.startDate = filterData.firstDate ? new Date(filterData.firstDate) : undefined;
      calendar.endDate = filterData.lastDate ? new Date(filterData.lastDate) : undefined;
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
        date: mapValue.undefinedIfEmptyLocalDate(filters?.date),
        shiftName: mapValue.undefinedIfEmptyString(filters?.shiftName),
      }).subscribe(schedule => {
        calendar.schedule = schedule;
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

}
