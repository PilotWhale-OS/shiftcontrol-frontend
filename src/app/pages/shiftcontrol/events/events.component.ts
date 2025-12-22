import {Component, inject} from "@angular/core";
import {RouterLink} from "@angular/router";
import {EventDto, EventEndpointService} from "../../../../shiftservice-client";
import {Observable} from "rxjs";
import {AsyncPipe, DatePipe} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faCalendarDays} from "@fortawesome/free-solid-svg-icons";
import {TooltipDirective} from "../../../directives/tooltip.directive";

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
  styleUrl: "./events.component.scss"
})
export class EventsComponent {

  public events$: Observable<EventDto[]>;

  protected readonly iconDate = faCalendarDays;
  private readonly _eventsService = inject(EventEndpointService);

  constructor() {
    this.events$ = this._eventsService.getAllEvents();
  }

}
