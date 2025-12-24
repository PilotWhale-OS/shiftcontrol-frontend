import {Component, inject, Input} from "@angular/core";
import {DialogComponent} from "../dialog/dialog.component";
import {ShiftDetailsViewComponent} from "../shift-details-view/shift-details-view.component";
import {DialogService} from "../../services/dialog/dialog.service";
import {faLocationDot} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {PositionSlotDto, ShiftDto, ShiftPlanScheduleDto} from "../../../shiftservice-client";
import {DatePipe, NgClass} from "@angular/common";

@Component({
  selector: "app-shift-calendar-grid",
  imports: [
    DialogComponent,
    ShiftDetailsViewComponent,
    FaIconComponent,
    DatePipe,
    NgClass
  ],
  standalone: true,
  templateUrl: "./shift-calendar-grid.component.html",
  styleUrl: "./shift-calendar-grid.component.scss"
})
export class ShiftCalendarGridComponent {

  @Input()
  public schedule?: ShiftPlanScheduleDto;

  protected hours = Array.from({length: 24}, (_, i) => i); // 0 to 23
  protected viewShift = false;

  protected readonly iconLocation = faLocationDot;

  private readonly activityWidth = "2rem";
  private readonly shiftWidth = "10rem";
  private readonly venueGapWidth = "1rem";
  private readonly minuteHeightRem = 0.05;

  // eslint-disable-next-line max-len, @typescript-eslint/member-ordering
  public readonly gridColumns =
    `[time-start] 5rem [time-end venue-a-start venue-a-activity-start] ${this.activityWidth}
    [venue-a-activity-end venue-a-shift-start venue-a-shift-col-1-start] ${this.shiftWidth}
    [venue-a-shift-col-1-end venue-a-shift-col-2-start] ${this.shiftWidth}
    [venue-a-shift-col-2-end venue-a-end venue-a-shift-end venue-a-gap-start] ${this.venueGapWidth}
    [venue-a-gap-end venue-b-start venue-b-activity-start] ${this.activityWidth}
    [venue-b-activity-end venue-b-shift-start venue-b-shift-col-1-start] ${this.shiftWidth}
    [venue-b-shift-col-1-end venue-b-shift-col-2-start] ${this.shiftWidth}
    [venue-b-shift-col-2-end venue-b-end venue-b-shift-end venue-b-gap-start] ${this.venueGapWidth}
    [venue-b-gap-end venue-c-start venue-c-activity-start] ${this.activityWidth}
    [venue-c-activity-end venue-c-shift-start venue-c-shift-col-1-start] ${this.shiftWidth}
    [venue-c-shift-col-1-end venue-c-shift-col-2-start] ${this.shiftWidth}
    [venue-c-shift-col-2-end venue-c-end venue-c-shift-end venue-c-gap-start] ${this.venueGapWidth}
    [venue-c-gap-end]`;

  private readonly _dialogService = inject(DialogService);

  public getMinuteHeight(durationMinutes: number) {
    return `${durationMinutes * this.minuteHeightRem}rem`;
  }

  protected getGridColumns(schedule: ShiftPlanScheduleDto){
    return `[time-start] 5rem [time-end ${
      schedule.locations?.map(locationColumn => {
        const locationName = locationColumn.location.id;
        return `venue-${locationName}-start venue-${locationName}-activity-start] ${
          this.activityWidth
        } [venue-${locationName}-activity-end venue-${locationName}-shift-start ${
          Array(locationColumn.requiredShiftColumns).fill(undefined).map((_, index) =>
            `venue-${locationName}-shift-col-${index + 1}-start] ${
              this.shiftWidth
            } [venue-${locationName}-shift-col-${index + 1}-end`).join(" ")
        } venue-${locationName}-shift-end venue-${locationName}-end venue-${locationName}-gap-start] ${
          this.venueGapWidth
        } [venue-${locationName}-gap-end`;
      }).join(" ")
    }]`;
  }

  protected getShiftMinutesDuration(shift: ShiftDto){
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime);
      const durationMs = end.getTime() - start.getTime();
      return Math.floor(durationMs / 60000); // convert ms to minutes
  }

  protected getShiftMinutesFromStart(shift: ShiftDto){
      const start = new Date(shift.startTime); // TODO subtract calendar start date
      return start.getHours() * 60 + start.getMinutes();
  }

  protected getShiftDisplayCategory(shift: ShiftDto): "eligible" | "signed-up" | undefined {
    if(shift.positionSlots.some(slot => slot.positionSignupState ===  PositionSlotDto.PositionSignupStateEnum.SignedUp)){
      return "signed-up";
    }
    if(shift.positionSlots.some(slot =>
      slot.positionSignupState ===  PositionSlotDto.PositionSignupStateEnum.SignupViaAuction ||
      slot.positionSignupState ===  PositionSlotDto.PositionSignupStateEnum.SignupViaTrade
    )){
      return "eligible";
    }

    return undefined;
  }

  protected getShiftDisplayTag(shift: ShiftDto): string {
    if(shift.positionSlots.some(slot => slot.positionSignupState ===  PositionSlotDto.PositionSignupStateEnum.SignedUp)){
      return "Signed Up";
    }
    if(shift.positionSlots.some(slot =>
      slot.positionSignupState ===  PositionSlotDto.PositionSignupStateEnum.SignupViaAuction ||
      slot.positionSignupState ===  PositionSlotDto.PositionSignupStateEnum.SignupViaTrade
    )){
      return "Eligible";
    }

    return "";
  }
}
