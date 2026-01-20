import {Component, inject} from "@angular/core";
import {ManageUnavailabilityComponent} from "../../../../components/manage-unavailability/manage-unavailability.component";
import {map, Observable, shareReplay, startWith, Subject, switchMap, tap} from "rxjs";
import {
  EventEndpointService,
  EventShiftPlansOverviewDto,
  ShiftPlanDashboardOverviewDto
} from "../../../../../shiftservice-client";
import {BC_EVENT} from "../../../../breadcrumbs";
import {ActivatedRoute, Router} from "@angular/router";
import {PageService} from "../../../../services/page/page.service";
import {icons} from "../../../../util/icons";
import {AsyncPipe} from "@angular/common";
import {ShiftScheduleComponent, shiftWithOrigin} from "../../../../components/shift-schedule/shift-schedule.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {ShiftTradeAuctionComponent} from "../../../../components/shift-trade-auction/shift-trade-auction.component";

@Component({
  selector: "app-volunteer-dashboard",
  imports: [
    ManageUnavailabilityComponent,
    AsyncPipe,
    ShiftScheduleComponent,
    FaIconComponent,
    ShiftTradeAuctionComponent
  ],
  standalone: true,
  templateUrl: "./volunteer-dashboard.component.html",
  styleUrl: "./volunteer-dashboard.component.scss"
})
export class VolunteerDashboardComponent {
  protected readonly event$: Observable<EventShiftPlansOverviewDto>;
  protected readonly eventDashboard$: Observable<ShiftPlanDashboardOverviewDto[]>;
  protected readonly reloadTradeAuctions$ = new Subject<void>();
  protected readonly shifts$: Observable<shiftWithOrigin[]>;
  protected readonly auctions$;
  protected readonly trades$;

  protected readonly icons = icons;

  private readonly _eventService = inject(EventEndpointService);
  private readonly _pageService = inject(PageService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  constructor() {
    const eventId = this._route.snapshot.paramMap.get("eventId");
    if(eventId === null) {
      this._router.navigateByUrl("/");
      throw new Error("Event ID is required");
    }

    this.eventDashboard$ = this.reloadTradeAuctions$.pipe(startWith(undefined)).pipe(
      switchMap(() => this._eventService.getEventsDashboard()),
      map(dashboard => dashboard.shiftPlanDashboardOverviewDtos
        .filter(plan => plan.eventOverview.id === eventId) // todo via call
      ),
      shareReplay()
    );

    this.shifts$ = this.eventDashboard$.pipe(
      map(plans => plans.flatMap(plan =>
        plan.shifts.map(shift => ({
          shift,
          originEvent: plan.eventOverview,
          originPlan: shift.shiftPlan
        })))),
    );

    this.auctions$ = this.eventDashboard$.pipe(
      map((plans) => plans.flatMap(plan => plan.auctions))
    );

    this.trades$ = this.eventDashboard$.pipe(
      map((plans) => plans.flatMap(plan => plan.trades))
    );

    this.event$ = this._eventService.getShiftPlansOverviewOfEvent(eventId).pipe(
      tap(event => {
        this._pageService
          .configurePageName(`${event.eventOverview.name}`)
          .configureBreadcrumb(BC_EVENT, event.eventOverview.name, event.eventOverview.id);
      }),
      shareReplay()
    );
  }
}
