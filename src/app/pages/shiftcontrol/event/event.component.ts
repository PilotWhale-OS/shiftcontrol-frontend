import {Component, inject} from "@angular/core";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {PageService} from "../../../services/page/page.service";
import {BC_EVENT} from "../../../breadcrumbs";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";
import {
  addUnavailabilityInput,
  DialogAddUnavailabilityComponent
} from "../../../components/dialog-add-unavailability/dialog-add-unavailability.component";
import {faCalendar, faCalendarDays, faGift, faHourglass, faPause, faPeopleGroup} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {
  EventEndpointService,
  EventShiftPlansOverviewDto,
  TimeConstraintCreateDto,
  TimeConstraintDto, TimeConstraintEndpointService
} from "../../../../shiftservice-client";
import {Observable, tap} from "rxjs";
import {AsyncPipe, DatePipe, DecimalPipe} from "@angular/common";
import {TooltipDirective} from "../../../directives/tooltip.directive";
import {DialogAddEmergencyComponent} from "../../../components/dialog-add-emergency/dialog-add-emergency.component";

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
    TooltipDirective,
    DialogAddEmergencyComponent,
    DecimalPipe
  ],
  standalone: true,
  templateUrl: "./event.component.html",
  styleUrl: "./event.component.scss"
})
export class EventComponent {

  protected readonly form;
  protected showUnavailabilityDialog = false;
  protected showEmergencyDialog = false;
  protected event$: Observable<EventShiftPlansOverviewDto>;
  protected timeConstraints$: Observable<TimeConstraintDto[]>;

  protected readonly iconVolunteers = faPeopleGroup;
  protected readonly iconHours = faHourglass;
  protected readonly iconDay = faCalendar;
  protected readonly iconDate = faCalendarDays;
  protected readonly iconRewards = faGift;
  protected readonly iconUnavailable = faPause;

  private readonly _pageService = inject(PageService);
  private readonly _fb = inject(FormBuilder);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _eventService = inject(EventEndpointService);
  private readonly _timeConstraintService = inject(TimeConstraintEndpointService);

  constructor() {
    const eventId = this._route.snapshot.paramMap.get("eventId");
    if(eventId === null) {
      this._router.navigateByUrl("/");
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

    this.timeConstraints$ = this._timeConstraintService.getTimeConstraints(eventId);
  }

  unavailabilitySubmitted(input: addUnavailabilityInput | undefined, event: EventShiftPlansOverviewDto){
    this.showUnavailabilityDialog = false;
    if(input === undefined) {
      return;
    }

    this._timeConstraintService.createTimeConstraint(event.eventOverview.id, {
      from: input.start ? input.start.toISOString() : event.eventOverview.startTime,
      to: input.end ? input.end.toISOString() : event.eventOverview.endTime,
      type: TimeConstraintCreateDto.TypeEnum.Unavailable
    }).subscribe(() => {
      this.timeConstraints$ = this._timeConstraintService.getTimeConstraints(event.eventOverview.id);
    });
  }

  emergencySubmitted(emergencyDate: Date | undefined, event: EventShiftPlansOverviewDto) {
    this.showEmergencyDialog = false;
    if (emergencyDate === undefined) {
      return;
    }

    this._timeConstraintService.createTimeConstraint(event.eventOverview.id, {
      from: emergencyDate.toISOString(),
      to: emergencyDate.toISOString(),
      type: TimeConstraintCreateDto.TypeEnum.Emergency
    }).subscribe(() => {
      this.timeConstraints$ = this._timeConstraintService.getTimeConstraints(event.eventOverview.id);
    });
  }

  removeUnavailability(constraint: TimeConstraintDto, event: EventShiftPlansOverviewDto) {
    this._timeConstraintService.deleteTimeConstraint(event.eventOverview.id, constraint.id).subscribe(() => {
      this.timeConstraints$ = this._timeConstraintService.getTimeConstraints(event.eventOverview.id);
    });
  }

  getUnavailabilityDayLength(constraint: TimeConstraintDto): string {
    const from = new Date(constraint.from);
    const to = new Date(constraint.to);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? "s" : ""}`;
  }
}
