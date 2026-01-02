import {Component, inject} from "@angular/core";
import {InputTextComponent} from "../../../../components/inputs/input-text/input-text.component";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {TypedFormControlDirective} from "../../../../directives/typed-form-control.directive";
import {faBackward, faBook, faCircleInfo, faForward, faTag} from "@fortawesome/free-solid-svg-icons";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {InputDateComponent} from "../../../../components/inputs/input-date/input-date.component";
import {InputButtonComponent} from "../../../../components/inputs/input-button/input-button.component";
import {EventEndpointService} from "../../../../../shiftservice-client";
import {mapValue} from "../../../../util/value-maps";
import {ActivatedRoute, Router} from "@angular/router";
import {map} from "rxjs";
import {PageService} from "../../../../services/page/page.service";
import {BC_EVENT} from "../../../../breadcrumbs";

@Component({
  selector: "app-manage-event",
  imports: [
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    FaIconComponent,
    InputDateComponent,
    InputButtonComponent
  ],
  templateUrl: "./manage-event.component.html",
  styleUrl: "./manage-event.component.scss"
})
export class ManageEventComponent {

  public readonly form;

  protected readonly iconName = faTag;
  protected readonly iconCaption = faCircleInfo;
  protected readonly iconDescription = faBook;
  protected readonly iconStartDate = faForward;
  protected readonly iconEndDate = faBackward;
  protected readonly eventId?: string;

  private readonly _fb = inject(FormBuilder);
  private readonly _eventService = inject(EventEndpointService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _pageService = inject(PageService);

  constructor() {
    this.form = this._fb.group({
      name: this._fb.nonNullable.control<string>("", [Validators.maxLength(30), Validators.required]),
      shortDescription: this._fb.nonNullable.control<string>("", [Validators.maxLength(100)]),
      longDescription: this._fb.nonNullable.control<string>("", [Validators.maxLength(1000)]),
      startDate: this._fb.nonNullable.control<Date>(new Date()),
      endDate: this._fb.nonNullable.control<Date>(new Date())
    });

    this.eventId = this._route.snapshot.paramMap.get("eventId") ?? undefined;

    if(this.eventId !== undefined) {
      this._eventService.getAllEvents().pipe(
        map(events => events.find(e => e.id === this.eventId))
      ).subscribe(event => {
        if (event === undefined) {throw new Error("No event found");}

        this._pageService
          .configurePageName(`Manage ${event.name}`)
          .configureBreadcrumb(BC_EVENT, event.name, event.id);

        this.form.setValue({
          name: event.name,
          shortDescription: event.shortDescription ?? "",
          longDescription: event.longDescription ?? "",
          startDate: new Date(event.startTime),
          endDate: new Date(event.endTime)
        });
      });
    }
  }

  create(){
    if(this.eventId !== undefined) {
      throw new Error("Cannot create in edit mode");
    }

    this.form.markAllAsTouched();

    if(this.form.valid) {
      this._eventService.createEvent({
        name: this.form.controls.name.value,
        shortDescription: mapValue.undefinedIfEmptyString(this.form.controls.shortDescription.value),
        longDescription: mapValue.undefinedIfEmptyString(this.form.controls.longDescription.value),
        startTime: mapValue.dateAsLocalDateStartOfDayString(this.form.controls.startDate.value),
        endTime: mapValue.dateAsLocalDateEndOfDayString(this.form.controls.endDate.value)
      }).subscribe(event => this._router.navigate([`../${event.id}`]));
    }
  }

  update(){
    if(this.eventId === undefined) {
      throw new Error("Cannot update in create mode");
    }

    this.form.markAllAsTouched();

    if(this.form.valid) {
      this._eventService.updateEvent(this.eventId, {
        name: this.form.controls.name.value,
        shortDescription: mapValue.undefinedIfEmptyString(this.form.controls.shortDescription.value),
        longDescription: mapValue.undefinedIfEmptyString(this.form.controls.longDescription.value),
        startTime: mapValue.dateAsLocalDateStartOfDayString(this.form.controls.startDate.value),
        endTime: mapValue.dateAsLocalDateEndOfDayString(this.form.controls.endDate.value)
      }).subscribe(() => this._router.navigate(["../"], {relativeTo: this._route}));
    }
  }

}
