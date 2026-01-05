import {Component, inject} from "@angular/core";
import {RouterLink} from "@angular/router";
import {EventDto, EventEndpointService} from "../../../../shiftservice-client";
import {Observable} from "rxjs";
import {AsyncPipe, DatePipe} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TooltipDirective} from "../../../directives/tooltip.directive";
import {UserService} from "../../../services/user/user.service";
import {icons} from "../../../util/icons";

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

  protected readonly icons = icons;

  private readonly _eventsService = inject(EventEndpointService);
  private _userService = inject(UserService);

  constructor() {
    this.events$ = this._eventsService.getAllEvents();
  }

  public get userType$() {
    return this._userService.userType$;
  }

}
