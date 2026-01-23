import {Component, inject, Input, OnDestroy} from "@angular/core";
import {RoleDto, ShiftPlanDto, UserPlanEndpointService} from "../../../shiftservice-client";
import {
  BehaviorSubject, catchError,
  combineLatest,
  combineLatestWith,
  debounceTime, distinctUntilChanged,
  filter,
  forkJoin,
  map, of,
  shareReplay,
  startWith,
  switchMap
} from "rxjs";
import { icons } from "../../util/icons";
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {AsyncPipe} from "@angular/common";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {InputTextComponent} from "../inputs/input-text/input-text.component";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {ToastService} from "../../services/toast/toast.service";
import {InputMultiselectComponent} from "../inputs/input-multiselect/input-multiselect.component";

export interface planVolunteersData {
  plan: ShiftPlanDto;
  roles: RoleDto[];
}

@Component({
  selector: "app-manage-plan-volunteers",
  imports: [
    AsyncPipe,
    InputButtonComponent,
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective,
    InputMultiselectComponent
  ],
  templateUrl: "./manage-plan-volunteers.component.html",
  styleUrl: "./manage-plan-volunteers.component.scss"
})
export class ManagePlanVolunteersComponent implements OnDestroy {

  protected page$;
  protected readonly manageData$ = new BehaviorSubject<planVolunteersData | undefined>(undefined);
  protected readonly roleSelectOptions$ = this.manageData$.pipe(
    filter((data): data is planVolunteersData => data !== undefined),
    map(data => data.roles.map(role => ({
      name: role.name,
      value: role
    })))
  );
  protected readonly roleSelectControls$;
  protected readonly icons = icons;
  protected readonly form;
  protected readonly pageSize = 20;

  private readonly _fb = inject(FormBuilder);
  private readonly _toastService = inject(ToastService);
  private readonly _userPlanService = inject(UserPlanEndpointService);
  private readonly _roleChangesSubscription;

  constructor() {
    this.form = this._fb.group({
      paginationIndex: this._fb.nonNullable.control<number>(0),
      search: this._fb.nonNullable.control<string>("")
    });

    this.page$ = this.form.valueChanges.pipe(
      startWith(this.form.value),
      debounceTime(100),
      combineLatestWith(this.manageData$.pipe(
        filter((data): data is planVolunteersData => data !== undefined
      ))),
      switchMap(([value, manageData]) => this._userPlanService.getAllUsersOfPlan(
        manageData.plan.id,
        value.paginationIndex ?? 0,
        this.pageSize, {
          name: value.search
        })
      ),
      shareReplay()
    );

    this.roleSelectControls$ = this.page$.pipe(
      combineLatestWith(this.roleSelectOptions$, this.manageData$.pipe(
        filter((data): data is planVolunteersData => data !== undefined
      ))),
      map(([page, options, data]) => {
        const controls = new Map<string, FormControl<RoleDto[]>>();

        page.items.forEach(v => controls.set(v.volunteer.id, this._fb.nonNullable.control<RoleDto[]>(v.roles, [Validators.required])));

        return {controls, options, data};
      }),
      shareReplay()
    );

    this._roleChangesSubscription = this.roleSelectControls$.pipe(
      switchMap(({controls, data}) => {
        const changes = Array.from(controls.entries()).map(([userId, control]) =>
          control.valueChanges.pipe(
            filter(() => control.dirty && control.valid),
            distinctUntilChanged(),
            debounceTime(100),
            switchMap(roles => this._userPlanService.updateUserRoles(data.plan.id, userId, {
              roles: roles.map(r => r.id)
            })),
            this._toastService.tapSaving("Volunteer Roles"),
            catchError(() => of(undefined))
          )
        );
        return forkJoin(changes);
      })
    ).subscribe();
  }

  @Input()
  public set manageData(data: planVolunteersData | undefined) {
    this.manageData$.next(data);
    this.form.patchValue({paginationIndex: 0, search: ""});
  }

  ngOnDestroy(): void {
    this._roleChangesSubscription.unsubscribe();
  }

}
