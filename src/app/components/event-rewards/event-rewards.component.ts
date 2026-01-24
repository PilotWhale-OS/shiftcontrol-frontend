import { Component, Input } from "@angular/core";
import {EventShiftPlansOverviewDto} from "../../../shiftservice-client";
import {BehaviorSubject} from "rxjs";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {icons} from "../../util/icons";
import {AsyncPipe} from "@angular/common";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";

@Component({
  selector: "app-event-rewards",
  imports: [
    FaIconComponent,
    AsyncPipe,
    InputButtonComponent
  ],
  standalone: true,
  templateUrl: "./event-rewards.component.html",
  styleUrl: "./event-rewards.component.scss"
})
export class EventRewardsComponent {
  protected readonly icons = icons;
  protected eventDashboard$ = new BehaviorSubject<undefined | EventShiftPlansOverviewDto>(undefined);

  @Input()
  public set eventDashboard(value: EventShiftPlansOverviewDto) {
    this.eventDashboard$.next(value);
  }
}
