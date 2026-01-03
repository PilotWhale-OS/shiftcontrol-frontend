import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {
  RoleDto, RoleEndpointService, RoleModificationDto, ShiftPlanDto
} from "../../../shiftservice-client";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {mapValue} from "../../util/value-maps";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {InputTextComponent} from "../inputs/input-text/input-text.component";
import {faCircleInfo, faHashtag, faMapMarker, faTag} from "@fortawesome/free-solid-svg-icons";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {NgClass} from "@angular/common";
import {DialogComponent} from "../dialog/dialog.component";

@Component({
  selector: "app-manage-role",
  imports: [
    FaIconComponent,
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputButtonComponent,
    NgClass,
    DialogComponent
  ],
  standalone: true,
  templateUrl: "./manage-role.component.html",
  styleUrl: "./manage-role.component.scss"
})
export class ManageRoleComponent {

  @Input({required: true})
  public plan?: ShiftPlanDto;

  @Output()
  public roleChanged = new EventEmitter<void>();

  protected readonly roleIcon = faHashtag;
  protected readonly iconName = faTag;
  protected readonly iconCaption = faCircleInfo;
  protected readonly form;
  protected _role?: RoleDto;

  protected showDeleteConfirm = false;

  private readonly _fb = inject(FormBuilder);
  private readonly _roleService = inject(RoleEndpointService);

  constructor() {
    this.form = this._fb.group({
      name: this._fb.nonNullable.control<string>("", [Validators.required]),
      description: this._fb.nonNullable.control<string>("")
    });
  }

  @Input()
  public set role(value: RoleDto) {
    this._role = value;

    this.form.markAsPristine();

    this.form.setValue({
      name: value.name,
      description: value.description ?? ""
    });
  }

  protected save() {
    if(this.form.invalid) {
      return;
    }

    const plan = this.plan;
    if(plan === undefined) {
      throw new Error("Plan is required to save role");
    }

    const roleData: RoleModificationDto = {
      name: this.form.controls.name.value,
      description: mapValue.undefinedIfEmptyString(this.form.controls.description.value) ?? "",
      selfAssignable: false
    };

    (this._role === undefined ?
      this._roleService.createRole(plan.id, roleData) :
      this._roleService.updateRole(plan.id, this._role.id, roleData)
    ).subscribe(() => {
      console.log("Role saved successfully.");
      this.roleChanged.emit();

      if(this._role === undefined) {
        this.form.reset();
      }
    });
  }

  protected delete() {
    if(this._role === undefined || this.plan === undefined) {
      throw new Error("Could not delete role in create mode or plan undefined");
    }

    this._roleService.deleteRole(this.plan.id, this._role.id).subscribe(() =>{
      console.log("Role deleted successfully.");
      this.roleChanged.emit();
    });
  }

  protected getOrder() {
    const order = Number(this._role?.id) * -1;
    if(isNaN(order)) {
      return Number.MIN_SAFE_INTEGER;
    }
    return order;
  }

}
