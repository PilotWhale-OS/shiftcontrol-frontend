import {Component, inject} from "@angular/core";
import {PageService} from "../../../services/breadcrumbs/page.service";
import {BC_SHIFT_DASHBOARD, BC_SHIFTS} from "../../../breadcrumbs";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: "app-plan-onboarding",
  imports: [
    InputButtonComponent,
    RouterLink
  ],
  standalone: true,
  templateUrl: "./plan-onboarding.component.html",
  styleUrl: "./plan-onboarding.component.scss"
})
export class PlanOnboardingComponent {

  private readonly _pageService = inject(PageService);

  constructor() {
    this._pageService
      .configureBreadcrumb(BC_SHIFTS, "Pilot Event", "someid")
      .configureBreadcrumb(BC_SHIFT_DASHBOARD, "Pilot Plan", "otherid");
  }

}
