import {Component, inject} from "@angular/core";
import {RouterLink} from "@angular/router";
import {UserService} from "../../../services/user/user.service";
import {AsyncPipe, NgClass} from "@angular/common";
import {BehaviorSubject, map, withLatestFrom} from "rxjs";
import {icons} from "../../../util/icons";
import {EventEndpointService} from "../../../../shiftservice-client";

@Component({
  selector: "app-home",
  imports: [
    RouterLink,
    AsyncPipe,
    NgClass
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss"
})
export class HomeComponent {

  protected readonly cards$ = new BehaviorSubject([
    {title:"User Account", content: "View your account and set preferences", href: "me", spotlight: false},
    {title:"Events", content: "Browse all your events", href: "events", spotlight: false},
  ]);
  protected readonly icons = icons;

  private readonly _userService = inject(UserService);
  private readonly _eventService = inject(EventEndpointService);

  constructor() {
    this._eventService.getAllOngoingEvents().pipe(
      withLatestFrom(this.cards$)
    ).subscribe(([events, cards]) => {
      this.cards$.next([
        ...cards,
        ...events.map(event => ({
          title: event.name,
          content: event.shortDescription ?? `${event.name} is currently ongoing. Click to view details.`,
          href: `events/${event.id}`,
          spotlight: true
        }))
      ]);
    });
  }

  protected get name$(){
    return this._userService.kcProfile$.pipe(
      map(user => `${user?.firstName}`)
    );
  }

}
