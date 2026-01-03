import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {
  EventDto,
  LocationDto, LocationEndpointService,
  LocationModificationDto
} from "../../../shiftservice-client";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {mapValue} from "../../util/value-maps";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {InputTextComponent} from "../inputs/input-text/input-text.component";
import {faCircleInfo, faLink, faLock, faMapMarker, faTag} from "@fortawesome/free-solid-svg-icons";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {NgClass} from "@angular/common";
import {DialogComponent} from "../dialog/dialog.component";

@Component({
  selector: "app-manage-location",
  imports: [
    FaIconComponent,
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputButtonComponent,
    NgClass,
    DialogComponent
  ],
  templateUrl: "./manage-location.component.html",
  styleUrl: "./manage-location.component.scss"
})
export class ManageLocationComponent {

  @Input({required: true})
  public event?: EventDto;

  @Output()
  public locationChanged = new EventEmitter<void>();

  protected readonly locationIcon = faMapMarker;
  protected readonly iconName = faTag;
  protected readonly iconCaption = faCircleInfo;
  protected readonly iconUrl = faLink;
  protected readonly iconLock = faLock;
  protected readonly form;
  protected _location?: LocationDto;

  protected showDeleteConfirm = false;

  private readonly _fb = inject(FormBuilder);
  private readonly _locationService = inject(LocationEndpointService);

  constructor() {
    this.form = this._fb.group({
      name: this._fb.nonNullable.control<string>("", [Validators.required]),
      description: this._fb.nonNullable.control<string>(""),
      url: this._fb.nonNullable.control<string>("")
    });
  }

  public get isPretalxManaged(){
    return this?._location?.readOnly === true;
  }

  @Input()
  public set location(value: LocationDto) {
    this._location = value;

    this.form.markAsPristine();

    this.form.setValue({
      name: value.name,
      description: value.description ?? "",
      url: value.url ?? ""
    });
  }

  protected save() {
    if(this.form.invalid) {
      return;
    }

    const event = this.event;
    if(event === undefined) {
      throw new Error("Event is required to save location");
    }

    const locationData: LocationModificationDto = {
      name: this.form.controls.name.value,
      description: mapValue.undefinedIfEmptyString(this.form.controls.description.value),
      url: mapValue.undefinedIfEmptyString(this.form.controls.url.value),
    };

    (this._location === undefined ?
      this._locationService.createLocation(event.id, locationData) :
      this._locationService.updateLocation(this._location.id, locationData)
    ).subscribe(() => {
      console.log("Location saved successfully.");
      this.locationChanged.emit();

      if(this._location === undefined) {
        this.form.reset();
      }
    });
  }

  protected delete() {
    if(this._location === undefined) {
      throw new Error("Could not delete location in create mode");
    }

    this._locationService.deleteLocation(this._location.id).subscribe(() =>{
      console.log("Location deleted successfully.");
      this.locationChanged.emit();
    });
  }

  protected getOrder() {
    const order = Number(this._location?.id) * -1;
    if(isNaN(order)) {
      return Number.MIN_SAFE_INTEGER;
    }
    return order;
  }

}
