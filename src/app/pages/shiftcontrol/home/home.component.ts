import {Component, inject} from "@angular/core";
import {RouterLink} from "@angular/router";
import {UserService} from "../../../services/user/user.service";
import {AsyncPipe, NgClass} from "@angular/common";
import {map, Observable} from "rxjs";
import {ShiftTradeAuctionComponent} from "../../../components/shift-trade-auction/shift-trade-auction.component";
import {ShiftScheduleComponent, shiftWithOrigin} from "../../../components/shift-schedule/shift-schedule.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {EventEndpointService, EventsDashboardOverviewDto} from "../../../../shiftservice-client";
import {icons} from "../../../util/icons";

@Component({
  selector: "app-home",
  imports: [
    RouterLink,
    AsyncPipe,
    ShiftTradeAuctionComponent,
    ShiftScheduleComponent,
    FaIconComponent,
    NgClass
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss"
})
export class HomeComponent {

  protected readonly cards = [
    {title:"Events", content: "Browse all your events", href: "events"},
    {title:"Pilot Plan", content: "Pilot Event: Currently active", href: "plans/planId", spotlight: true}
  ];
  protected readonly icons = icons;

  protected readonly dashboard$: Observable<EventsDashboardOverviewDto>;
  protected readonly shiftsWithOrigin$: Observable<shiftWithOrigin[]>;

  private readonly _userService = inject(UserService);
  private readonly _eventService = inject(EventEndpointService);

  constructor() {
    this.dashboard$ = this._eventService.getEventsDashboard();
    this.shiftsWithOrigin$ = this.dashboard$.pipe(
      map(dashboard => this.flatMapDashboardShifts(dashboard))
    );
  }

  protected get name$(){
    return this._userService.profile$.pipe(
      map(user => `${user?.firstName}`)
    );
  }

  protected flatMapDashboardShifts(dashboard: EventsDashboardOverviewDto) {
    return dashboard.shiftPlanDashboardOverviewDtos.flatMap(planDashboard => planDashboard.shifts.map(shift => ({
          shift: shift,
          originEvent: planDashboard.eventOverview,
          originPlan: planDashboard.shiftPlan
        })));
  }

}
