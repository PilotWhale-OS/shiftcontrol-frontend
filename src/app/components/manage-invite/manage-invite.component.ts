import {Component, EventEmitter, inject, Input, Output} from "@angular/core";
import {
  RoleDto, ShiftPlanDto, ShiftPlanInviteCreateRequestDto, ShiftPlanInviteDto
} from "../../../shiftservice-client";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faCircleInfo, faLink, faLock, faMapMarker, faTag} from "@fortawesome/free-solid-svg-icons";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {NgClass} from "@angular/common";
import {InputSelectComponent, SelectOptions} from "../inputs/input-select/input-select.component";
import {ShiftPlanEndpointService} from "../../../shiftservice-client/api/shift-plan-endpoint.service";

@Component({
  selector: "app-manage-invite",
  imports: [
    FaIconComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputButtonComponent,
    NgClass,
    InputSelectComponent
  ],
  templateUrl: "./manage-invite.component.html",
  styleUrl: "./manage-invite.component.scss"
})
export class ManageInviteComponent {

  @Input({required: true})
  public plan?: ShiftPlanDto;

  @Input()
  public invite?: ShiftPlanInviteDto;

  @Output()
  public inviteChanged = new EventEmitter<void>();

  protected readonly locationIcon = faMapMarker;
  protected readonly iconName = faTag;
  protected readonly iconCaption = faCircleInfo;
  protected readonly iconUrl = faLink;
  protected readonly iconLock = faLock;
  protected readonly form;

  protected inviteOptions: SelectOptions<ShiftPlanInviteCreateRequestDto.TypeEnum> = [
    {name: "Planner Join", value: ShiftPlanInviteCreateRequestDto.TypeEnum.PlannerJoin},
    {name: "Volunteer Join", value: ShiftPlanInviteCreateRequestDto.TypeEnum.VolunteerJoin}
  ];
  protected roleOptions: SelectOptions<string> = [];

  private readonly _fb = inject(FormBuilder);
  private readonly _planService = inject(ShiftPlanEndpointService);

  constructor() {
    this.form = this._fb.group({
      roles: this._fb.nonNullable.control<string[]>([]),
      expiry: this._fb.nonNullable.control<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      maxUses: this._fb.nonNullable.control<number>(100),
      type: this._fb.nonNullable.control<ShiftPlanInviteCreateRequestDto.TypeEnum>(
        ShiftPlanInviteCreateRequestDto.TypeEnum.VolunteerJoin, [Validators.required]
      ),
      enableExpiry: this._fb.nonNullable.control<boolean>(false),
      enableMaxUses: this._fb.nonNullable.control<boolean>(false)
    });
  }

  @Input()
  public set roles(value: RoleDto[]) {
    this.roleOptions = value.map(role => ({name: role.name, value:role.id}));
  }

  protected create() {
    if(this.form.invalid) {
      return;
    }

    const plan = this.plan;
    if(plan === undefined) {
      throw new Error("Plan is required to create an invite");
    }

    const createData: ShiftPlanInviteCreateRequestDto = {
      type: this.form.controls.type.value,
      expiresAt: this.form.controls.enableExpiry.value ?
        this.form.controls.expiry.value.toISOString() : undefined,
      maxUses: this.form.controls.enableMaxUses.value ?
        this.form.controls.maxUses.value : undefined,
      autoAssignRoleIds: this.form.controls.roles.value.length > 0 ?
        this.form.controls.roles.value.map(v => Number(v)) : undefined
    };

    this._planService.createShiftPlanInvite(plan.id, createData).subscribe(invite => {
      console.log(invite);
      this.inviteChanged.emit();
    });
  }

  protected getOrder() {
    const order = new Date(this.invite?.createdAt ?? "").getTime() * -1;
    if(isNaN(order)) {
      return Number.MIN_SAFE_INTEGER;
    }
    return order;
  }

}
