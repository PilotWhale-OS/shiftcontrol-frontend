import {Component, inject} from "@angular/core";
import {RouterLink} from "@angular/router";
import {UserService} from "../../../services/user/user.service";
import {AsyncPipe} from "@angular/common";
import {map} from "rxjs";
import {ShiftTradeAuctionComponent} from "../../../components/shift-trade-auction/shift-trade-auction.component";
import {ShiftScheduleComponent} from "../../../components/shift-schedule/shift-schedule.component";

@Component({
  selector: "app-home",
  imports: [
    RouterLink,
    AsyncPipe,
    ShiftTradeAuctionComponent,
    ShiftScheduleComponent
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss"
})
export class HomeComponent {

  public readonly cards = [
    {title:"Events", content: "Manage your events and shift plans", href: "events"},
    {title:"User Account", content: "Manage your notification settings and unavailable time", href: "me"},
    {title:"Pilot Plan", content: "Pilot Event: Currently active", href: "plans/planId"}
  ];

  private readonly _userService = inject(UserService);

  public get name$(){
    return this._userService.profile$.pipe(
      map(user => `${user?.firstName} ${user?.lastName}`)
    );
  }
}
