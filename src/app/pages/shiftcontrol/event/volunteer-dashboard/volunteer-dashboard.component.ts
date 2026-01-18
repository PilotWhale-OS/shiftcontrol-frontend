import {Component, inject} from "@angular/core";
import {ManageUnavailabilityComponent} from "../../../../components/manage-unavailability/manage-unavailability.component";
import {Observable, shareReplay, tap} from "rxjs";
import {EventEndpointService, EventShiftPlansOverviewDto} from "../../../../../shiftservice-client";
import {BC_EVENT} from "../../../../breadcrumbs";
import {ActivatedRoute, Router} from "@angular/router";
import {PageService} from "../../../../services/page/page.service";
import {icons} from "../../../../util/icons";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: "app-volunteer-dashboard",
  imports: [
    ManageUnavailabilityComponent,
    AsyncPipe
  ],
  templateUrl: "./volunteer-dashboard.component.html",
  styleUrl: "./volunteer-dashboard.component.scss"
})
export class VolunteerDashboardComponent {
  protected readonly event$: Observable<EventShiftPlansOverviewDto>;

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
