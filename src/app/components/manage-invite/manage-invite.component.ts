import {Component, EventEmitter, inject, Input, OnDestroy, Output} from "@angular/core";
import {
  RoleDto, ShiftPlanDto, ShiftPlanInviteCreateRequestDto, ShiftPlanInviteDto, ShiftPlanInviteEndpointService
} from "../../../shiftservice-client";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {
  faCalendarDay,
  faCertificate,
  faClock, faHashtag,
  faLink,
  faLock,
  faMessage,
  faStop,
  faTag,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {DatePipe, NgClass} from "@angular/common";
import {InputSelectComponent, SelectOptions} from "../inputs/input-select/input-select.component";
import {InputMultiselectComponent} from "../inputs/input-multiselect/input-multiselect.component";
import {InputToggleComponent} from "../inputs/input-toggle/input-toggle.component";
import {InputDateComponent} from "../inputs/input-date/input-date.component";
import {Subscription} from "rxjs";
import {InputNumberComponent} from "../inputs/input-number/input-number.component";

@Component({
  selector: "app-manage-invite",
  imports: [
    FaIconComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputButtonComponent,
    NgClass,
    InputSelectComponent,
    InputMultiselectComponent,
    InputToggleComponent,
    InputDateComponent,
    InputNumberComponent,
    DatePipe
  ],
  templateUrl: "./manage-invite.component.html",
  styleUrl: "./manage-invite.component.scss"
})
export class ManageInviteComponent implements OnDestroy {

  @Input({required: true})
  public plan?: ShiftPlanDto;

  @Input()
  public invite?: ShiftPlanInviteDto;

  @Output()
  public inviteChanged = new EventEmitter<void>();

  protected readonly iconInvite = faMessage;
  protected readonly iconActive = faCertificate;
  protected readonly iconType = faUser;
  protected readonly iconRole = faTag;
  protected readonly iconExpiry = faClock;
  protected readonly iconLimit = faStop;
  protected readonly iconLock = faLock;
  protected readonly iconDate = faCalendarDay;
  protected readonly iconCounter = faHashtag;
  protected readonly iconUrl = faLink;
  protected readonly form;

  protected inviteOptions: SelectOptions<ShiftPlanInviteCreateRequestDto.TypeEnum> = [
    {name: "Planner Join", value: ShiftPlanInviteCreateRequestDto.TypeEnum.PlannerJoin},
    {name: "Volunteer Join", value: ShiftPlanInviteCreateRequestDto.TypeEnum.VolunteerJoin}
  ];
  protected roleOptions: SelectOptions<string> = [];

  private readonly _fb = inject(FormBuilder);
  private readonly _inviteService = inject(ShiftPlanInviteEndpointService);

  private readonly _expiryEnabledSubscription?: Subscription;
  private readonly _maxUsesEnabledSubscription?: Subscription;

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

    this.form.controls.expiry.disable();
    this.form.controls.maxUses.disable();

    this._expiryEnabledSubscription = this.form.controls.enableExpiry.valueChanges.subscribe(enableExpiry => {
      if(this.form.controls.expiry.disabled && enableExpiry) {
        this.form.controls.expiry.enable();
      } else if(this.form.controls.expiry.enabled && !enableExpiry){
        this.form.controls.expiry.disable();
      }
    });

    this._maxUsesEnabledSubscription = this.form.controls.enableMaxUses.valueChanges.subscribe(enableMaxUses => {
      if(this.form.controls.maxUses.disabled && enableMaxUses) {
        this.form.controls.maxUses.enable();
      } else if(this.form.controls.maxUses.enabled && !enableMaxUses){
        this.form.controls.maxUses.disable();
      }
    });
  }

  @Input()
  public set roles(value: RoleDto[]) {
    this.roleOptions = value.map(role => ({name: role.name, value:role.id}));
  }

  ngOnDestroy() {
    this._expiryEnabledSubscription?.unsubscribe();
    this._maxUsesEnabledSubscription?.unsubscribe();
  }

  protected getInviteLink(invite: ShiftPlanInviteDto) {
    const base = window.location.origin;
    return `${base}/join/${invite.code}`;
  }

  protected copyInviteLinkToClipboard(invite: ShiftPlanInviteDto) {
    const link = this.getInviteLink(invite);
    navigator.clipboard.writeText(link).then(() => {
      console.log("Invite link copied to clipboard");
    }).catch(err => {
      console.error("Failed to copy invite link to clipboard", err);
    });
  }

  protected getInviteName(invite: ShiftPlanInviteDto) {
    return this.inviteOptions.find(option => option.value === invite.type)?.name ?? "Unknown Invite";
  }

  protected getAssignedRolesList(invite: ShiftPlanInviteDto) {
    if(invite.autoAssignedRoles === undefined || invite.autoAssignedRoles.length === 0) {
      return "No Roles Assigned";
    }

    return invite.autoAssignedRoles.map(role => role.name).join(", ");
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
        this.form.controls.roles.value : undefined
    };

    this._inviteService.createShiftPlanInvite(plan.id, createData).subscribe(invite => {
      console.log(invite);
      this.inviteChanged.emit();
    });
  }

  protected revoke(invite: ShiftPlanInviteDto) {
    this._inviteService.revokeShiftPlanInvite(invite.code).subscribe(() => {
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
