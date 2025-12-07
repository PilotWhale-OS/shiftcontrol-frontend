import { Component } from "@angular/core";

@Component({
  selector: "app-shift-calendar-grid",
  imports: [],
  standalone: true,
  templateUrl: "./shift-calendar-grid.component.html",
  styleUrl: "./shift-calendar-grid.component.scss"
})
export class ShiftCalendarGridComponent {

  public hours = Array.from({length: 24}, (_, i) => i); // 0 to 23

  private readonly activityWidth = "15rem";
  private readonly shiftWidth = "20rem";
  private readonly minuteHeightRem = 0.05;

  // eslint-disable-next-line max-len, @typescript-eslint/member-ordering
  public readonly gridColumns =
    `[time-start] 5rem [time-end venue-a-start venue-a-activity-start] ${this.activityWidth}
    [venue-a-activity-end venue-a-shift-start venue-a-shift-col-1-start] ${this.shiftWidth}
    [venue-a-shift-col-1-end venue-a-shift-col-2-start] ${this.shiftWidth}
    [venue-a-shift-col-2-end venue-a-end venue-a-shift-end venue-b-start venue-b-activity-start] ${this.activityWidth}
    [venue-b-activity-end venue-b-shift-start venue-b-shift-col-1-start] ${this.shiftWidth}
    [venue-b-shift-col-1-end venue-b-shift-col-2-start] ${this.shiftWidth}
    [venue-b-shift-col-2-end venue-b-end venue-b-shift-end]`;

  public getMinuteHeight(durationMinutes: number){
    return `${durationMinutes * this.minuteHeightRem}rem`;
  }
}
