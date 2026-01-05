import {Component, inject} from "@angular/core";
import {PageService} from "../../../services/page/page.service";
import {BC_EVENT, BC_PLAN_DASHBOARD} from "../../../breadcrumbs";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {ShiftTradeAuctionComponent} from "../../../components/shift-trade-auction/shift-trade-auction.component";
import {ShiftScheduleComponent, shiftWithOrigin} from "../../../components/shift-schedule/shift-schedule.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {ShiftPlanDashboardOverviewDto, ShiftPlanEndpointService} from "../../../../shiftservice-client";
import {BehaviorSubject, filter, map, Observable, switchMap, tap} from "rxjs";
import {AsyncPipe, DatePipe, DecimalPipe} from "@angular/common";
import {TooltipDirective} from "../../../directives/tooltip.directive";
import {UserService} from "../../../services/user/user.service";
import {icons} from "../../../util/icons";

@Component({
  selector: "app-shift-plan",
  imports: [
    RouterLink,
    ShiftTradeAuctionComponent,
    ShiftScheduleComponent,
    FaIconComponent,
    AsyncPipe,
    DatePipe,
    TooltipDirective,
    DecimalPipe
  ],
  standalone: true,
  templateUrl: "./shift-plan.component.html",
  styleUrl: "./shift-plan.component.scss"
})
export class ShiftPlanComponent {
  protected dashboard$ = new BehaviorSubject<undefined | ShiftPlanDashboardOverviewDto>(undefined);
  protected shiftsWithOrigin$: Observable<shiftWithOrigin[]>;

  protected readonly icons = icons;

  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _pageService = inject(PageService);
  private readonly _planService = inject(ShiftPlanEndpointService);
  private readonly _userService = inject(UserService);

  constructor() {
    const shiftPlanId = this._route.snapshot.paramMap.get("shiftPlanId");
    if(shiftPlanId === null) {
      this._router.navigateByUrl("/");
      throw new Error("Shift Plan ID is required");
    }

    this._planService.getShiftPlanDashboard(shiftPlanId).pipe(
      tap(dashboard => {
        this._pageService
          .configurePageName(`${dashboard.shiftPlan.name} Dashboard`)
          .configureBreadcrumb(BC_EVENT, dashboard.eventOverview.name, dashboard.eventOverview.id)
          .configureBreadcrumb(BC_PLAN_DASHBOARD, dashboard.shiftPlan.name, `/plans/${dashboard.shiftPlan.id}`);
      }),
      tap({error: () => {
        this._router.navigateByUrl("/");
      }})
    ).subscribe(dashboard => {
      this.dashboard$.next(dashboard);
    });

    this.shiftsWithOrigin$ = this.dashboard$.pipe(
      filter(dashboard => dashboard !== undefined),
      map(dashboard => this.mapShiftsWithOrigin(dashboard))
    );
  }

  protected get canManagePlan$(){
    return this.dashboard$.pipe(
      filter(dashboard => dashboard !== undefined),
      switchMap(dashboard => this._userService.canManagePlan$(dashboard.shiftPlan.id))
    );
  }

  protected mapShiftsWithOrigin(dashboard: ShiftPlanDashboardOverviewDto) {
    return dashboard.shifts.map(shift => ({
        shift: shift,
        originEvent: dashboard.eventOverview,
        originPlan: dashboard.shiftPlan
      }));
  }
}
