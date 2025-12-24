import {Component, inject, Input} from "@angular/core";
import {DialogComponent} from "../dialog/dialog.component";
import {ShiftDetailsViewComponent} from "../shift-details-view/shift-details-view.component";
import {DialogService} from "../../services/dialog/dialog.service";
import {faLocationDot} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {ActivityDto, PositionSlotDto, ShiftDto, ShiftPlanScheduleDto} from "../../../shiftservice-client";
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

  @Input()
  public startDate?: Date;

  @Input()
  public endDate?: Date;

  /* protected hours = Array.from({length: 24}, (_, i) => i); // 0 to 23*/
  protected viewShift = false;

  protected readonly iconLocation = faLocationDot;

  private readonly activityWidth = "2rem";
  private readonly shiftWidth = "10rem";
  private readonly venueGapWidth = "1rem";
  private readonly minuteHeightRem = 0.05;

  private readonly _dialogService = inject(DialogService);

  public getHours() {
    if(this.startDate === undefined || this.endDate === undefined) {
      throw new Error("startDate and endDate inputs are required to calculate hours");
    }

    const totalHours = Math.ceil(
      (this.endDate.getTime() - (this.startDate.getTime())) / (1000 * 60 * 60)
    ) + 24; // since end is inclusive
    return Array.from({length: totalHours}, (_, i) => i);
  }

  public getMinuteHeight(durationMinutes: number) {
    return `${durationMinutes * this.minuteHeightRem}rem`;
  }

  public getDayOfHour(hourIndex: number) {
    if(this.startDate === undefined) {
      throw new Error("startDate input is required to calculate day of hour");
    }
    const date = new Date(this.startDate.getTime() + hourIndex * 60 * 60 * 1000);
    return date;
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
    } blank-start] 1fr [blank-end]`;
  }

  /**
   * Get the duration of a shift in minutes
   * @param shift
   * @protected
   */
  protected getItemMinutesDuration(shift: ShiftDto | ActivityDto){
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime);
      const durationMs = end.getTime() - start.getTime();
      return Math.floor(durationMs / 60000); // convert ms to minutes
  }

  /**
   * Get the minutes from the start of the calendar day to the shift start time
   * @param shift
   * @param startTimestamp
   * @protected
   */
  protected getItemMinutesFromStart(shift: ShiftDto | ActivityDto){
    if(this.startDate === undefined) {
      throw new Error("startDate input is required to calculate shift position");
    }
    const shiftStart = new Date(shift.startTime);
    const durationMs = shiftStart.getTime() - this.startDate.getTime();
    return Math.floor(durationMs / 60000); // convert ms to minutes
  }

  /**
   * Get the display/color category for a shift based on signup state
   * @param shift
   * @protected
   */
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

  /**
   * Get the caption/tag for a shift based on signup state
   * @param shift
   * @protected
   */
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
