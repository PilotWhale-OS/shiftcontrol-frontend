import {Component, inject} from "@angular/core";
import {PageService} from "../../../services/page/page.service";
import {BC_PLAN_DASHBOARD, BC_EVENT} from "../../../breadcrumbs";
import {RouterLink} from "@angular/router";
import {ShiftTradeAuctionComponent} from "../../../components/shift-trade-auction/shift-trade-auction.component";
import {ShiftScheduleComponent} from "../../../components/shift-schedule/shift-schedule.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faBarsProgress, faShuffle} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-shift-dashboard",
  imports: [
    RouterLink,
    ShiftTradeAuctionComponent,
    ShiftScheduleComponent,
    FaIconComponent
  ],
  standalone: true,
  templateUrl: "./shift-plan-dashboard.component.html",
  styleUrl: "./shift-plan-dashboard.component.scss"
})
export class ShiftPlanDashboardComponent {

  protected readonly iconTasks = faBarsProgress;
  protected readonly iconTrade = faShuffle;

  private readonly _pageService = inject(PageService);

  constructor() {
    this._pageService
      .configureBreadcrumb(BC_EVENT, "Pilot Event", "eventId")
      .configureBreadcrumb(BC_PLAN_DASHBOARD, "Pilot Plan", "planId");
  }
}
