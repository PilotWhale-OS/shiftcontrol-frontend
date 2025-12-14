import {Component, inject} from "@angular/core";
import {PageService} from "../../../services/page/page.service";
import {BC_PLAN_DASHBOARD, BC_SHIFT_DETAILS, BC_EVENT} from "../../../breadcrumbs";
import {ShiftDetailsViewComponent} from "../../../components/shift-details-view/shift-details-view.component";

@Component({
  selector: "app-shift-details",
  imports: [ShiftDetailsViewComponent],
  standalone: true,
  templateUrl: "./shift-details.component.html",
  styleUrl: "./shift-details.component.scss"
})
export class ShiftDetailsComponent {

  private readonly _pageService = inject(PageService);

  constructor() {
    this._pageService
      .configurePageName("Pilot Shift Details")
      .configureBreadcrumb(BC_EVENT, "Pilot Event", "eventId")
      .configureBreadcrumb(BC_PLAN_DASHBOARD, "Pilot Plan", "planId")
      .configureBreadcrumb(BC_SHIFT_DETAILS, "Pilot Shift", "shiftId");

    console.log(this._pageService.breadcrumbs);
  }

}
