import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {
  RoleDto, RoleEndpointService, RoleModificationDto, ShiftPlanDto
} from "../../../shiftservice-client";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {mapValue} from "../../util/value-maps";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {InputTextComponent} from "../inputs/input-text/input-text.component";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {NgClass} from "@angular/common";
import {DialogComponent} from "../dialog/dialog.component";
import {icons} from "../../util/icons";
import {InputNumberComponent} from "../inputs/input-number/input-number.component";
import {ToastService} from "../../services/toast/toast.service";

@Component({
  selector: "app-manage-role",
  imports: [
    FaIconComponent,
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputButtonComponent,
    NgClass,
    DialogComponent,
    InputNumberComponent
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

  protected readonly icons = icons;
  protected readonly form;
  protected _role?: RoleDto;

  protected showDeleteConfirm = false;

  private readonly _fb = inject(FormBuilder);
  private readonly _roleService = inject(RoleEndpointService);
  private readonly _toastService = inject(ToastService);

  constructor() {
    this.form = this._fb.group({
      name: this._fb.nonNullable.control<string>("", [Validators.required]),
      description: this._fb.nonNullable.control<string>(""),
      rewardPointsPerMinute: this._fb.nonNullable.control<number>(0, [Validators.min(0)])
    });
  }

  @Input()
  public set role(value: RoleDto) {
    this._role = value;

    this.form.markAsPristine();

    this.form.setValue({
      name: value.name,
      description: value.description ?? "",
      rewardPointsPerMinute: value.rewardPointsPerMinute
    });
  }

  protected save() {
    this.form.markAllAsTouched();

    if(this.form.invalid) {
      this._toastService.showError("Invalid Role", "Please provide valid role details.");
      return;
    }

    const plan = this.plan;
    if(plan === undefined) {
      throw new Error("Plan is required to save role");
    }

    const roleData: RoleModificationDto = {
      name: this.form.controls.name.value,
      description: mapValue.undefinedIfEmptyString(this.form.controls.description.value),
      selfAssignable: false,
      rewardPointsPerMinute: this.form.controls.rewardPointsPerMinute.value
    };

    (this._role === undefined ?
      this._roleService.createRole(plan.id, roleData) :
      this._roleService.updateRole(this._role.id, roleData)
    ).pipe(
      this._role === undefined ?
        this._toastService.tapCreating("Role", item => item.name) :
        this._toastService.tapSaving("Role", item => item.name)
    ).subscribe(() => {
      this.roleChanged.emit();

      if(this._role === undefined) {
        this.form.reset();
      }
    });
  }

  protected delete() {
    if(this._role === undefined) {
      throw new Error("Could not delete role in create mode");
    }

    this._roleService.deleteRole(this._role.id).pipe(
      this._toastService.tapDeleting("Role", item => item.name)
    ).subscribe(() =>{
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
