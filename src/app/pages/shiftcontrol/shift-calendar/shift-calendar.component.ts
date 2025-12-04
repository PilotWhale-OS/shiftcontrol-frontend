import {Component, inject} from "@angular/core";
import {PageService} from "../../../services/breadcrumbs/page.service";
import {BC_SHIFT_DASHBOARD, BC_SHIFTS} from "../../../breadcrumbs";

@Component({
  selector: "app-shift-calendar",
  imports: [],
  standalone: true,
  templateUrl: "./shift-calendar.component.html",
  styleUrl: "./shift-calendar.component.scss"
})
export class ShiftCalendarComponent {

  private readonly _pageService = inject(PageService);

  constructor() {
    this._pageService
      .configureBreadcrumb(BC_SHIFTS, "Pilot Event", "someid")
      .configureBreadcrumb(BC_SHIFT_DASHBOARD, "Pilot Plan", "otherid");
  }

}
