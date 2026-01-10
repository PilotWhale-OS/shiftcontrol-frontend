import {Component, inject} from "@angular/core";
import {InputTextComponent} from "../../../../components/inputs/input-text/input-text.component";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {TypedFormControlDirective} from "../../../../directives/typed-form-control.directive";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {InputDateComponent} from "../../../../components/inputs/input-date/input-date.component";
import {InputButtonComponent} from "../../../../components/inputs/input-button/input-button.component";
import {EventDto, EventEndpointService, LocationDto, LocationEndpointService} from "../../../../../shiftservice-client";
import {mapValue} from "../../../../util/value-maps";
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, filter, map, switchMap, take} from "rxjs";
import {PageService} from "../../../../services/page/page.service";
import {BC_EVENT} from "../../../../breadcrumbs";
import {AsyncPipe} from "@angular/common";
import {ManageLocationComponent} from "../../../../components/manage-location/manage-location.component";
import {DialogComponent} from "../../../../components/dialog/dialog.component";
import {icons} from "../../../../util/icons";
import {ToastService} from "../../../../services/toast/toast.service";

@Component({
  selector: "app-manage-event",
  imports: [
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    FaIconComponent,
    InputDateComponent,
    InputButtonComponent,
    AsyncPipe,
    ManageLocationComponent,
    DialogComponent
  ],
  templateUrl: "./manage-event.component.html",
  styleUrl: "./manage-event.component.scss"
})
export class ManageEventComponent {

  public readonly form;

  protected readonly icons = icons;

  protected readonly eventId?: string;
  protected readonly locations$=
    new BehaviorSubject<undefined | { locations: LocationDto[]; event: EventDto }>(undefined);

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

    const eventId = this._route.snapshot.paramMap.get("eventId") ?? undefined;
    this.eventId = eventId;

    if(eventId !== undefined) {
      this._eventService.getEventById(eventId).subscribe(event => {
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

        this._locationsService.getAllLocationsForEvent(eventId).pipe(
          map(locations => ({locations, event}))
        ).subscribe(l => this.locations$.next(l));
      });
    }
  }

  protected create(){
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
      }).pipe(
        this._toastService.tapSuccess("Event Created", event => `New event "${event.name}" has been created.`)
      ).subscribe(event => this._router.navigate([`../${event.id}`], {relativeTo: this._route}));
    } else {
      this._toastService.showError("Invalid Event", "Please provide valid event details.");
    }
  }

  protected update(){
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
      }).pipe(
        this._toastService.tapSuccess("Event Saved", event => `Event details of "${event.name}" have been updated.`)
      ).subscribe(() => this._router.navigate(["../"], {relativeTo: this._route}));
    } else {
      this._toastService.showError("Invalid Event", "Please provide valid event details.");
    }
  }

  protected clone() {
    if(this.eventId === undefined) {
      throw new Error("Cannot clone in create mode");
    }

    this._eventService.cloneEvent(this.eventId).pipe(
      this._toastService.tapSuccess("Event Clone")
    ).subscribe(event => {
      this._router.navigate([`../../${event.id}`], {relativeTo: this._route});
    });
  }

  protected delete() {
    if(this.eventId === undefined) {
      throw new Error("Cannot delete in create mode");
    }

    this._eventService.deleteEvent(this.eventId).pipe(
      this._toastService.tapSuccess("Event Deleted")
    ).subscribe(() => this._router.navigate(["../"], {relativeTo: this._route}));
  }

  protected refreshLocations(){
    this.locations$.pipe(
      take(1),
      filter(data => data !== undefined),
      switchMap(data => this._locationsService.getAllLocationsForEvent(data.event.id).pipe(
        map(locations => ({locations, event: data.event}))
      ))
    ).subscribe(v => this.locations$.next(v));
  }

}
