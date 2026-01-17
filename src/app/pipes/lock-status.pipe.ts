import { Pipe, PipeTransform } from "@angular/core";
import {ShiftDto} from "../../shiftservice-client";
import LockStatusEnum = ShiftDto.LockStatusEnum;

@Pipe({
  name: "lockStatus"
})
export class LockStatusPipe implements PipeTransform {

  transform(value: LockStatusEnum, mode: "name" | "description" = "name"): unknown {
    switch (mode) {
      case "description":
        switch (value) {
          case LockStatusEnum.Locked:
            return "Volunteers can take no actions to change their assignments. Planners can still manually adjust assignments.";
          case LockStatusEnum.SelfSignup:
            return "Volunteers can freely sign up and remove themselves from shifts.";
          case LockStatusEnum.Supervised:
            return "No changes to assignment count can be made. " +
              "Volunteers can only trade positions. Planners can still manually adjust assignments.";
          default:
            return "Unknown";
        }
      case "name":
        switch (value) {
          case LockStatusEnum.Locked:
            return "Locked";
          case LockStatusEnum.SelfSignup:
            return "Self Signup";
          case LockStatusEnum.Supervised:
            return "Supervised";
          default:
            return "Unknown";
        }
    }
  }
}
