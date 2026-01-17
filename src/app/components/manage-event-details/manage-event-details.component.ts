import {Component, inject, Input, Output} from "@angular/core";
import {InputTextComponent} from "../inputs/input-text/input-text.component";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {InputDateComponent} from "../inputs/input-date/input-date.component";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {EventDto, EventEndpointService, LocationEndpointService} from "../../../shiftservice-client";
import {mapValue} from "../../util/value-maps";
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, Subject} from "rxjs";
import {PageService} from "../../services/page/page.service";
import {AsyncPipe} from "@angular/common";
import {DialogComponent} from "../dialog/dialog.component";
import {icons} from "../../util/icons";
import {ToastService} from "../../services/toast/toast.service";

@Component({
  selector: "app-manage-event-details",
  imports: [
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    FaIconComponent,
    InputDateComponent,
    InputButtonComponent,
    AsyncPipe,
    DialogComponent
  ],
  templateUrl: "./manage-event-details.component.html",
  styleUrl: "./manage-event-details.component.scss"
})
export class ManageEventDetailsComponent {

  @Output()
  public readonly eventChanged = new Subject<void>();

  protected readonly form;
  protected readonly icons = icons;

  protected readonly event$ = new BehaviorSubject<EventDto | undefined>(undefined);

  protected showEventDeleteConfirm = false;

  private readonly _fb = inject(FormBuilder);
  private readonly _eventService = inject(EventEndpointService);
  private readonly _toastService = inject(ToastService);
  private readonly _locationsService = inject(LocationEndpointService);
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
  }

  @Input()
  public set event(value: EventDto | undefined) {
    this.event$.next(value);

    if(value !== undefined) {
      this.form.setValue({
        name: value.name,
        shortDescription: value.shortDescription ?? "",
        longDescription: value.longDescription ?? "",
        startDate: new Date(value.startTime),
        endDate: new Date(value.endTime)
      });
    } else {
      this.form.reset();
    }
  }

  protected create(){

    this.form.markAllAsTouched();

    if(this.form.valid) {
      this._eventService.createEvent({
        name: this.form.controls.name.value,
        shortDescription: mapValue.undefinedIfEmptyString(this.form.controls.shortDescription.value),
        longDescription: mapValue.undefinedIfEmptyString(this.form.controls.longDescription.value),
        startTime: mapValue.dateAsLocalDateStartOfDayString(this.form.controls.startDate.value),
        endTime: mapValue.dateAsLocalDateEndOfDayString(this.form.controls.endDate.value)
      }).pipe(
        this._toastService.tapCreating("Event", event => event.name)
      ).subscribe(() => this.eventChanged.next());
    } else {
      this._toastService.showError("Invalid Event", "Please provide valid event details.");
    }
  }

  protected update(event: EventDto){
    this.form.markAllAsTouched();

    if(this.form.valid) {
      this._eventService.updateEvent(event.id, {
        name: this.form.controls.name.value,
        shortDescription: mapValue.undefinedIfEmptyString(this.form.controls.shortDescription.value),
        longDescription: mapValue.undefinedIfEmptyString(this.form.controls.longDescription.value),
        startTime: mapValue.dateAsLocalDateStartOfDayString(this.form.controls.startDate.value),
        endTime: mapValue.dateAsLocalDateEndOfDayString(this.form.controls.endDate.value)
      }).pipe(
        this._toastService.tapSaving("Event", updated => updated.name)
      ).subscribe(() => this.eventChanged.next());
    } else {
      this._toastService.showError("Invalid Event", "Please provide valid event details.");
    }
  }

  protected clone(event: EventDto) {

    this._eventService.cloneEvent(event.id).pipe(
      this._toastService.tapSuccess("Event Clone"),
      this._toastService.tapError("Error cloning event", mapValue.apiErrorToMessage)
    ).subscribe(cloned => this._router.navigate([`../../${cloned.id}`], {relativeTo: this._route}));
  }

  protected delete(event: EventDto) {
    this._eventService.deleteEvent(event.id).pipe(
      this._toastService.tapDeleting("Event")
    ).subscribe(() => this._router.navigate(["../../"], {relativeTo: this._route}));
  }
}
