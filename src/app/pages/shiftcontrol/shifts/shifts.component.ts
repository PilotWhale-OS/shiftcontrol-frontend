import {Component, inject} from "@angular/core";
import {RouterLink} from "@angular/router";
import {PageService} from "../../../services/breadcrumbs/page.service";
import {BC_SHIFTS} from "../../../breadcrumbs";

@Component({
  selector: "app-shifts",
  imports: [
    RouterLink
  ],
  standalone: true,
  templateUrl: "./shifts.component.html",
  styleUrl: "./shifts.component.scss"
})
export class ShiftsComponent {

  private readonly _pageService = inject(PageService);

  constructor() {
    this._pageService.configureBreadcrumb(BC_SHIFTS, "Pilot Event", "someid");
  }

}
