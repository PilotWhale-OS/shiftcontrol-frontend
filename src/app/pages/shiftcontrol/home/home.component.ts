import {Component, inject} from "@angular/core";
import {RouterLink} from "@angular/router";
import {UserService} from "../../../services/user/user.service";
import {AsyncPipe, NgClass} from "@angular/common";
import {map} from "rxjs";
import {icons} from "../../../util/icons";

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

  protected readonly cards = [
    {title:"Events", content: "Browse all your events", href: "events"},
    {title:"Pilot Plan", content: "Pilot Event: Currently active\n(coming soon)", href: "/", spotlight: true}
  ];
  protected readonly icons = icons;

  private readonly _userService = inject(UserService);

  protected get name$(){
    return this._userService.kcProfile$.pipe(
      map(user => `${user?.firstName}`)
    );
  }

}
