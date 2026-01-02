import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {
  EventDto,
  LocationCollectionEndpointService,
  LocationDto,
  LocationItemEndpointService,
  LocationModificationDto
} from "../../../shiftservice-client";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {mapValue} from "../../util/value-maps";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {InputTextComponent} from "../inputs/input-text/input-text.component";
import {faCircleInfo, faLink, faMapMarker, faMarker, faTag} from "@fortawesome/free-solid-svg-icons";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {NgClass} from "@angular/common";

@Component({
  selector: "app-manage-location",
  imports: [
    FaIconComponent,
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputButtonComponent,
    NgClass
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
  protected readonly form;
  protected _location?: LocationDto;

  private readonly _fb = inject(FormBuilder);
  private readonly locationItemService = inject(LocationItemEndpointService);
  private readonly locationCollectionService = inject(LocationCollectionEndpointService);

  constructor() {
    this.form = this._fb.group({
      name: this._fb.nonNullable.control<string>("", [Validators.required]),
      description: this._fb.nonNullable.control<string>(""),
      url: this._fb.nonNullable.control<string>("")
    });
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
      this.locationCollectionService.createLocation(event.id, locationData) :
      this.locationItemService.updateLocation(this._location.id, locationData)
    ).subscribe(() => {
      console.log("Location saved successfully.");
      this.locationChanged.emit();
    });
  }

  protected delete() {
    if(this._location === undefined) {
      throw new Error("Could not delete location in create mode");
    }

    this.locationItemService.deleteLocation(this._location.id).subscribe(() =>{
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
