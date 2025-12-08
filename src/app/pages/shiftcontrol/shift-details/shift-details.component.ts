import {Component, inject} from "@angular/core";
import {PageService} from "../../../services/breadcrumbs/page.service";
import {BC_SHIFT_DASHBOARD, BC_SHIFT_DETAILS, BC_SHIFTS} from "../../../breadcrumbs";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";

@Component({
  selector: "app-shift-details",
  imports: [InputButtonComponent],
  standalone: true,
  templateUrl: "./shift-details.component.html",
  styleUrl: "./shift-details.component.scss"
})
export class ShiftDetailsComponent {

  private readonly _pageService = inject(PageService);

  constructor() {
    this._pageService
      .configureBreadcrumb(BC_SHIFTS, "Pilot Event", "someid")
      .configureBreadcrumb(BC_SHIFT_DASHBOARD, "Pilot Plan", "otherid")
      .configureBreadcrumb(BC_SHIFT_DETAILS, "Pilot Shift", "thatid");
  }

}
