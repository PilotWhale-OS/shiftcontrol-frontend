import {Component, inject} from "@angular/core";
import {RouterLink} from "@angular/router";
import {PageService} from "../../../services/breadcrumbs/page.service";
import {BC_EVENT} from "../../../breadcrumbs";

@Component({
  selector: "app-plans",
  imports: [
    RouterLink
  ],
  standalone: true,
  templateUrl: "./event.component.html",
  styleUrl: "./event.component.scss"
})
export class EventComponent {

  private readonly _pageService = inject(PageService);

  constructor() {
    this._pageService.configureBreadcrumb(BC_EVENT, "Pilot Event", "eventId");
  }

}
