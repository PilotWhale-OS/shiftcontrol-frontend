import {Component, inject} from "@angular/core";
import {RouterLink} from "@angular/router";
import {PageService} from "../../../services/page/page.service";
import {BC_EVENT} from "../../../breadcrumbs";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";
import {DialogAddUnavailabilityComponent} from "../../../components/dialog-add-unavailability/dialog-add-unavailability.component";
import {faCalendar, faGift, faHourglass, faPeopleGroup} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
  selector: "app-plans",
  imports: [
    RouterLink,
    ReactiveFormsModule,
    InputButtonComponent,
    DialogAddUnavailabilityComponent,
    FaIconComponent
  ],
  standalone: true,
  templateUrl: "./event.component.html",
  styleUrl: "./event.component.scss"
})
export class EventComponent {

  public readonly form;
  public showUnavailabilityDialog = false;
  protected readonly iconVolunteers = faPeopleGroup;
  protected readonly iconHours = faHourglass;
  protected readonly iconDay = faCalendar;
  protected readonly iconRewards = faGift;
  private readonly _pageService = inject(PageService);
  private readonly _fb = inject(FormBuilder);

  constructor() {
    this._pageService
      .configurePageName("Pilot Event Dashboard")
      .configureBreadcrumb(BC_EVENT, "Pilot Event", "eventId");

    this.form = this._fb.group({
      unavailabilityFromEventStart: this._fb.nonNullable.control<boolean>(false),
      unavailabilityUntilEventEnd: this._fb.nonNullable.control<boolean>(false),
      unavailabilityFrom: this._fb.nonNullable.control<Date>(new Date()),
      unavailabilityUntil: this._fb.nonNullable.control<Date>(new Date()),
    });
  }

}
