import {Component, Input} from "@angular/core";
import {RouterLink} from "@angular/router";
import {faCalendar, faLocationDot, faStar, faWrench} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TooltipDirective} from "../../directives/tooltip.directive";
import {EventDto, PositionSlotDto, ShiftDto, ShiftPlanDto} from "../../../shiftservice-client";
import {BehaviorSubject} from "rxjs";
import {AsyncPipe, DatePipe} from "@angular/common";

type groupedShifts = Map<Date, shiftWithOrigin[]>;

export interface shiftWithOrigin {
  shift: ShiftDto;
  originEvent: EventDto;
  originPlan: ShiftPlanDto;
}

@Component({
  selector: "app-shift-schedule",
  imports: [
    RouterLink,
    FaIconComponent,
    TooltipDirective,
    AsyncPipe,
    DatePipe
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

  protected readonly shifts$ = new BehaviorSubject<groupedShifts>(new Map());

  protected readonly iconEvent = faStar;
  protected readonly iconPlan = faCalendar;
  protected readonly iconRole = faWrench;
  protected readonly iconLocation = faLocationDot;

  @Input()
  public set shifts(shifts: shiftWithOrigin[]) {
    this.shifts$.next(this.groupShiftsByLocalDate(shifts));
  }

  protected groupShiftsByLocalDate(shifts: shiftWithOrigin[]): groupedShifts {
    const map: groupedShifts = new Map();
    for (const shift of shifts) {
      const localDate = new Date(shift.shift.startTime);
      localDate.setHours(0, 0, 0, 0);
      if (!map.has(localDate)) {
        map.set(localDate, []);
      }
      map.get(localDate)?.push(shift);
    }

    return map;
  }

  protected getAssignedPositionSlots(shift: ShiftDto) {
    return shift.positionSlots.filter(slot => slot.positionSignupState === PositionSlotDto.PositionSignupStateEnum.SignedUp);
  }

}
