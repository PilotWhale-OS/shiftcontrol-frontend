import {Component, Input} from "@angular/core";
import {RouterLink} from "@angular/router";

@Component({
  selector: "app-shift-schedule",
  imports: [
    RouterLink
  ],
  standalone: true,
  templateUrl: "./shift-schedule.component.html",
  styleUrl: "./shift-schedule.component.scss"
})
export class ShiftScheduleComponent {

  @Input()
  public showShiftOrigin = false;

}
