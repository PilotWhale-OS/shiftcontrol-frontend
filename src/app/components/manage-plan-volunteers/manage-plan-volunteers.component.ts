import {Component, inject, Input} from "@angular/core";
import {RoleDto, ShiftPlanDto, UserPlanEndpointService} from "../../../shiftservice-client";
import {BehaviorSubject, combineLatestWith, debounceTime, filter, map, shareReplay, startWith, switchMap} from "rxjs";
import { icons } from "../../util/icons";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {AsyncPipe} from "@angular/common";
import {InputButtonComponent} from "../inputs/input-button/input-button.component";
import {InputTextComponent} from "../inputs/input-text/input-text.component";
import {TypedFormControlDirective} from "../../directives/typed-form-control.directive";
import {RouterLink} from "@angular/router";

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
    RouterLink
  ],
  templateUrl: "./manage-plan-volunteers.component.html",
  styleUrl: "./manage-plan-volunteers.component.scss"
})
export class ManagePlanVolunteersComponent {

  protected page$;
  protected readonly manageData$ = new BehaviorSubject<planVolunteersData | undefined>(undefined);
  protected readonly roleSelectOptions$ = this.manageData$.pipe(
    filter((data): data is planVolunteersData => data !== undefined),
    map(data => data.roles.map(role => ({
      name: role.name,
      value: role
    })))
  );
  protected readonly icons = icons;
  protected readonly form;
  protected readonly pageSize = 20;

  private readonly _fb = inject(FormBuilder);
  private readonly _userPlanService = inject(UserPlanEndpointService);

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
  }

  @Input()
  public set manageData(data: planVolunteersData | undefined) {
    this.manageData$.next(data);
    this.form.patchValue({paginationIndex: 0, search: ""});
  }

}
