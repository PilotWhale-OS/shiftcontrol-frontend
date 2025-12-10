import {Component, inject} from "@angular/core";
import {RouterLink} from "@angular/router";
import {PageService} from "../../../services/breadcrumbs/page.service";
import {BC_EVENT} from "../../../breadcrumbs";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {InputDateComponent} from "../../../components/inputs/input-date/input-date.component";
import {TypedFormControlDirective} from "../../../directives/typed-form-control.directive";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";

@Component({
  selector: "app-plans",
  imports: [
    RouterLink,
    InputDateComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputButtonComponent
  ],
  standalone: true,
  templateUrl: "./event.component.html",
  styleUrl: "./event.component.scss"
})
export class EventComponent {

  public readonly form;
  private readonly _pageService = inject(PageService);
  private readonly _fb = inject(FormBuilder);

  constructor() {
    this._pageService.configureBreadcrumb(BC_EVENT, "Pilot Event", "eventId");
    this.form = this._fb.group({
      unavailabilityFromEventStart: this._fb.nonNullable.control<boolean>(false),
      unavailabilityUntilEventEnd: this._fb.nonNullable.control<boolean>(false),
      unavailabilityFrom: this._fb.nonNullable.control<Date>(new Date()),
      unavailabilityUntil: this._fb.nonNullable.control<Date>(new Date()),
    });
  }

}
