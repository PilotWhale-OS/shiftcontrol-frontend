import {Component, inject} from "@angular/core";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {PageService} from "../../../services/page/page.service";
import {BC_EVENT} from "../../../breadcrumbs";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";
import {DialogAddUnavailabilityComponent} from "../../../components/dialog-add-unavailability/dialog-add-unavailability.component";
import {faCalendar, faCalendarDays, faGift, faHourglass, faPause, faPeopleGroup} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {EventEndpointService, EventShiftPlansOverviewDto} from "../../../../shiftservice-client";
import {Observable, tap} from "rxjs";
import {AsyncPipe, DatePipe} from "@angular/common";
import {TooltipDirective} from "../../../directives/tooltip.directive";

@Component({
  selector: "app-plans",
  imports: [
    RouterLink,
    ReactiveFormsModule,
    InputButtonComponent,
    DialogAddUnavailabilityComponent,
    FaIconComponent,
    AsyncPipe,
    DatePipe,
    TooltipDirective
  ],
  standalone: true,
  templateUrl: "./event.component.html",
  styleUrl: "./event.component.scss"
})
export class EventComponent {

  public readonly form;
  public showUnavailabilityDialog = false;
  public event$: Observable<EventShiftPlansOverviewDto>;

  protected readonly iconVolunteers = faPeopleGroup;
  protected readonly iconHours = faHourglass;
  protected readonly iconDay = faCalendar;
  protected readonly iconDate = faCalendarDays;
  protected readonly iconRewards = faGift;
  protected readonly iconUnavailable = faPause;

  private readonly _pageService = inject(PageService);
  private readonly _fb = inject(FormBuilder);
  private readonly _route = inject(ActivatedRoute);
  private readonly _eventService = inject(EventEndpointService);

  constructor() {
    const eventId = this._route.snapshot.paramMap.get("eventId");
    if(eventId === null) {
      throw new Error("Event ID is required");
    }

    this.form = this._fb.group({
      unavailabilityFromEventStart: this._fb.nonNullable.control<boolean>(false),
      unavailabilityUntilEventEnd: this._fb.nonNullable.control<boolean>(false),
      unavailabilityFrom: this._fb.nonNullable.control<Date>(new Date()),
      unavailabilityUntil: this._fb.nonNullable.control<Date>(new Date()),
    });

    this.event$ = this._eventService.getShiftPlansOverviewOfEvent(eventId).pipe(
      tap(event => {
        this._pageService
          .configurePageName(`${event.eventOverview.name}`)
          .configureBreadcrumb(BC_EVENT, event.eventOverview.name, event.eventOverview.id);
      })
    );
  }
}
