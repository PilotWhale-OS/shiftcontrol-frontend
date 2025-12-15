import {Component, Input} from "@angular/core";
import {RouterLink} from "@angular/router";
import {faCalendar, faLocationDot, faStar, faWrench} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TooltipDirective} from "../../directives/tooltip.directive";

@Component({
  selector: "app-shift-schedule",
  imports: [
    RouterLink,
    FaIconComponent,
    TooltipDirective
  ],
  standalone: true,
  templateUrl: "./shift-schedule.component.html",
  styleUrl: "./shift-schedule.component.scss"
})
export class ShiftScheduleComponent {

  @Input()
  public showShiftOrigin = false;

  @Input()
  public showShiftDescription = false;

  @Input()
  public showShiftPersonalDetails = false;

  iconEvent = faStar;
  iconPlan = faCalendar;
  iconRole = faWrench;
  iconLocation = faLocationDot;

}
