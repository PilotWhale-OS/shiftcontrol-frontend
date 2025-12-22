import {Component, inject} from "@angular/core";
import {PageService} from "../../../services/page/page.service";
import {BC_PLAN_DASHBOARD, BC_EVENT} from "../../../breadcrumbs";
import {RouterLink} from "@angular/router";
import {ShiftTradeAuctionComponent} from "../../../components/shift-trade-auction/shift-trade-auction.component";
import {ShiftScheduleComponent} from "../../../components/shift-schedule/shift-schedule.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faBarsProgress, faCalendar, faGift, faHourglass, faPeopleGroup, faShuffle} from "@fortawesome/free-solid-svg-icons";
import {DashboardOverviewDto, ShiftPlanEndpointService} from "../../../../shiftservice-client";
import {Observable, tap} from "rxjs";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: "app-shift-dashboard",
  imports: [
    RouterLink,
    ShiftTradeAuctionComponent,
    ShiftScheduleComponent,
    FaIconComponent,
    AsyncPipe
  ],
  standalone: true,
  templateUrl: "./shift-plan-dashboard.component.html",
  styleUrl: "./shift-plan-dashboard.component.scss"
})
export class ShiftPlanDashboardComponent {

  public dashboard$: Observable<DashboardOverviewDto>;

  protected readonly iconTasks = faBarsProgress;
  protected readonly iconTrade = faShuffle;
  protected readonly iconVolunteers = faPeopleGroup;
  protected readonly iconHours = faHourglass;
  protected readonly iconDay = faCalendar;
  protected readonly iconRewards = faGift;
  protected readonly iconCalendar = faCalendar;

  private readonly _pageService = inject(PageService);
  private readonly _planService = inject(ShiftPlanEndpointService);

  constructor() {
    this.dashboard$ = this._planService.getShiftPlanDashboard("1").pipe(
      tap(dashboard => {
        this._pageService
          .configurePageName(`${dashboard.shiftPlan.name} Dashboard`)
          .configureBreadcrumb(BC_EVENT, dashboard.eventOverview.name, dashboard.eventOverview.id)
          .configureBreadcrumb(BC_PLAN_DASHBOARD, dashboard.shiftPlan.name, `/plans/${dashboard.shiftPlan.id}`);
      })
    );
  }
}
