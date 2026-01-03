import {Component, inject} from "@angular/core";
import {RouterLink} from "@angular/router";
import {EventDto, EventEndpointService} from "../../../../shiftservice-client";
import {Observable} from "rxjs";
import {AsyncPipe, DatePipe} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faCalendarDays, faPlusCircle} from "@fortawesome/free-solid-svg-icons";
import {TooltipDirective} from "../../../directives/tooltip.directive";
import {UserService} from "../../../services/user/user.service";

@Component({
  selector: "app-events",
  imports: [
    RouterLink,
    AsyncPipe,
    DatePipe,
    FaIconComponent,
    TooltipDirective
  ],
  templateUrl: "./events.component.html",
  standalone: true,
  styleUrl: "./events.component.scss"
})
export class EventsComponent {

  public events$: Observable<EventDto[]>;

  protected readonly iconDate = faCalendarDays;
  protected readonly iconCreate = faPlusCircle;
  private readonly _eventsService = inject(EventEndpointService);
  private _userService = inject(UserService);

  constructor() {
    this.events$ = this._eventsService.getAllEvents();
  }

  public get userType$() {
    return this._userService.userType$;
  }

}
