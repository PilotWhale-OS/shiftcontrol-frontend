import {Component, inject} from "@angular/core";
import {PageService} from "../../../services/breadcrumbs/page.service";
import {BC_SHIFT_DASHBOARD, BC_SHIFTS} from "../../../breadcrumbs";
import {RouterLink} from "@angular/router";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";

@Component({
  selector: "app-shift-dashboard",
  imports: [
    RouterLink,
    InputButtonComponent
  ],
  standalone: true,
  templateUrl: "./shift-plan-dashboard.component.html",
  styleUrl: "./shift-plan-dashboard.component.scss"
})
export class ShiftPlanDashboardComponent {

  private readonly _pageService = inject(PageService);

  constructor() {
    this._pageService
      .configureBreadcrumb(BC_SHIFTS, "Pilot Event", "someid")
      .configureBreadcrumb(BC_SHIFT_DASHBOARD, "Pilot Plan", "otherid");
  }

}
