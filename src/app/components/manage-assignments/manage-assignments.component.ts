import {Component, inject, Input, OnDestroy, Output} from "@angular/core";
import { icons } from "../../util/icons";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {
  AssignmentFilterDto,
  AssignmentRequestDto,
  ShiftPlanDto,
  ShiftPlanEndpointService,
  SignupEndpointService
} from "../../../shiftservice-client";
import {BehaviorSubject, combineLatestWith, filter, startWith, Subject, Subscription, switchMap} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {LockStatusPipe} from "../../pipes/lock-status.pipe";
import {InputMultiToggleComponent, MultiToggleOptions} from "../inputs/input-multitoggle/input-multi-toggle.component";
import LockStatusEnum = ShiftPlanDto.LockStatusEnum;
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {ToastService} from "../../services/toast/toast.service";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import StatusesEnum = AssignmentFilterDto.StatusesEnum;

@Component({
  selector: "app-manage-assignments",
  imports: [
    AsyncPipe,
    LockStatusPipe,
    InputMultiToggleComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputButtonComponent,
    FaIconComponent
  ],
  standalone: true,
  templateUrl: "./manage-assignments.component.html",
  styleUrl: "./manage-assignments.component.scss"
})
export class ManageAssignmentsComponent implements OnDestroy {

  @Output()
  public planChanged = new Subject<void>();

  protected readonly plan$ = new BehaviorSubject<ShiftPlanDto | undefined>(undefined);
  protected readonly assignments$ = new BehaviorSubject<AssignmentRequestDto[]>([]);

  protected readonly icons = icons;
  protected readonly form;
  protected readonly phaseOptions: MultiToggleOptions<LockStatusEnum> = [
    { value: LockStatusEnum.SelfSignup, name: "Self Signup" },
    { value: LockStatusEnum.Supervised, name: "Supervised" },
    { value: LockStatusEnum.Locked, name: "Locked" }
  ];
  protected readonly statusOptions: MultiToggleOptions<StatusesEnum> = [
    { value: StatusesEnum.Accepted, name: "Assigned" },
    { value: StatusesEnum.Auction, name: "Auctioned" },
    { value: StatusesEnum.AuctionRequestForUnassign, name: "Requested Unassign" },
    { value: StatusesEnum.RequestForAssignment, name: "Requested Assignment" },
  ];

  private readonly _fb = inject(FormBuilder);
  private readonly _toastService = inject(ToastService);
  private readonly _signupService = inject(SignupEndpointService);
  private readonly _planService = inject(ShiftPlanEndpointService);
  private readonly _filterSubscription: Subscription;

  constructor() {
    this.form = this._fb.group({
      assignmentPhase: this._fb.nonNullable.control<LockStatusEnum>(ShiftPlanDto.LockStatusEnum.SelfSignup),
      assignmentStatus: this._fb.nonNullable.control<StatusesEnum>(StatusesEnum.AuctionRequestForUnassign)
    });

    this._filterSubscription = this.form.controls.assignmentStatus.valueChanges.pipe(
      startWith(this.form.controls.assignmentStatus.value),
      combineLatestWith(this.plan$.pipe(
        filter((plan): plan is ShiftPlanDto => plan !== undefined)
      )),
      switchMap(([status, plan]) => this._signupService.getSlots(plan.id, {
        statuses: [status]
      }))
    ).subscribe(data => this.assignments$.next(data));
  }

  @Input()
  public set plan(plan: ShiftPlanDto | undefined) {
    this.plan$.next(plan);

    if(plan !== undefined) {
      this.form.controls.assignmentPhase.setValue(plan.lockStatus);
    } else {
      this.form.reset();
    }
  }

  ngOnDestroy() {
    this._filterSubscription.unsubscribe();
  }

  protected getChanges(from: LockStatusEnum, to: LockStatusEnum) {
    if(
      from === LockStatusEnum.Supervised && to === LockStatusEnum.SelfSignup ||
      from === LockStatusEnum.Locked && to === LockStatusEnum.SelfSignup
    ){
      return "During phase transition, all current assignments will be retained, but " +
        "assignments requesting for unassignment or auction will be unassigned.\n";
    }

    return "";
  }

  protected updatePhase(plan: ShiftPlanDto) {
    const newPhase = this.form.controls.assignmentPhase.value;
    if(plan.lockStatus !== newPhase) {
      this._planService.editLockStatus(plan.id, {
        lockStatus: newPhase
      }).pipe(
        this._toastService.tapSaving("Shift Plan Phase")
      ).subscribe(() => this.planChanged.next());
    }
  }

}
