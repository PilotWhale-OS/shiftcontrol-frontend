import {Component, inject} from "@angular/core";
import {PageService} from "../../../services/page/page.service";
import {BC_EVENT, BC_PLAN_DASHBOARD} from "../../../breadcrumbs";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {ShiftTradeAuctionComponent} from "../../../components/shift-trade-auction/shift-trade-auction.component";
import {ShiftScheduleComponent, shiftWithOrigin} from "../../../components/shift-schedule/shift-schedule.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faBarsProgress, faCalendar, faCalendarDays, faGift, faHourglass, faPeopleGroup, faShuffle} from "@fortawesome/free-solid-svg-icons";
import {ShiftPlanDashboardOverviewDto, ShiftPlanEndpointService} from "../../../../shiftservice-client";
import {map, Observable, tap} from "rxjs";
import {AsyncPipe, DatePipe, DecimalPipe} from "@angular/common";
import {TooltipDirective} from "../../../directives/tooltip.directive";
import {UserService} from "../../../services/user/user.service";

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
  protected dashboard$: Observable<ShiftPlanDashboardOverviewDto>;
  protected shiftsWithOrigin$: Observable<shiftWithOrigin[]>;

  protected readonly iconTasks = faBarsProgress;
  protected readonly iconTrade = faShuffle;
  protected readonly iconVolunteers = faPeopleGroup;
  protected readonly iconHours = faHourglass;
  protected readonly iconDay = faCalendar;
  protected readonly iconDate = faCalendarDays;
  protected readonly iconRewards = faGift;
  protected readonly iconCalendar = faCalendar;

  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _pageService = inject(PageService);
  private readonly _planService = inject(ShiftPlanEndpointService);
  private readonly _userService = inject(UserService);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  protected readonly canManagePlan$ = this._userService.canManagePlan$.bind(this._userService);

  constructor() {
    const shiftPlanId = this._route.snapshot.paramMap.get("shiftPlanId");
    if(shiftPlanId === null) {
      this._router.navigateByUrl("/");
      throw new Error("Shift Plan ID is required");
    }

    this.dashboard$ = this._planService.getShiftPlanDashboard(shiftPlanId).pipe(
      tap(dashboard => {
        this._pageService
          .configurePageName(`${dashboard.shiftPlan.name} Dashboard`)
          .configureBreadcrumb(BC_EVENT, dashboard.eventOverview.name, dashboard.eventOverview.id)
          .configureBreadcrumb(BC_PLAN_DASHBOARD, dashboard.shiftPlan.name, `/plans/${dashboard.shiftPlan.id}`);
      }),
      tap({error: () => {
        this._router.navigateByUrl("/");
      }})
    );

    this.shiftsWithOrigin$ = this.dashboard$.pipe(
      map(dashboard => this.mapShiftsWithOrigin(dashboard))
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
