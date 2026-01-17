import {Component, inject} from "@angular/core";
import {PageService} from "../../../../services/page/page.service";
import { icons } from "../../../../util/icons";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {
  EventEndpointService,
  EventShiftPlansOverviewDto, RoleEndpointService,
  ShiftPlanDto,
  ShiftPlanInviteEndpointService
} from "../../../../../shiftservice-client";
import {
  BehaviorSubject,
  combineLatestWith,
  delay,
  filter,
  map, of,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
} from "rxjs";
import {BC_EVENT} from "../../../../breadcrumbs";
import {InputMultiToggleComponent, MultiToggleOptions} from "../../../../components/inputs/input-multitoggle/input-multi-toggle.component";
import {AsyncPipe} from "@angular/common";
import {InputSelectComponent, SelectOptions} from "../../../../components/inputs/input-select/input-select.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TypedFormControlDirective} from "../../../../directives/typed-form-control.directive";
import {ManageInviteComponent} from "../../../../components/manage-invite/manage-invite.component";
import {ManageRoleComponent} from "../../../../components/manage-role/manage-role.component";

export type managementMode = "invites" | "assignments" | "users" | "roles";
export interface planManagementNavigation {
  navigateTo: ShiftPlanDto | null;
  mode: managementMode;
}

@Component({
  selector: "app-manage-shift-plans",
  imports: [
    AsyncPipe,
    FaIconComponent,
    InputSelectComponent,
    TypedFormControlDirective,
    ReactiveFormsModule,
    InputMultiToggleComponent,
    ManageInviteComponent,
    ManageRoleComponent
  ],
  templateUrl: "./manage-shift-plans.component.html",
  styleUrl: "./manage-shift-plans.component.scss"
})
export class ManageShiftPlansComponent {

  protected readonly form;
  protected readonly event$ = new BehaviorSubject<EventShiftPlansOverviewDto | undefined>(undefined);
  protected readonly planManageData$;
  protected readonly invitesManageData$;
  protected readonly rolesManageData$;
  protected readonly shiftPlanOptions$;
  protected readonly mode$;
  protected readonly selectedMode$;
  protected readonly icons = icons;

  protected readonly modeOptions: MultiToggleOptions<managementMode> = [
    {name: "Invites", value: "invites"},
    {name: "Roles", value: "roles"},
    {name: "Assignments", value: "assignments"},
    {name: "Users", value: "users"}
  ];

  private readonly _pageService = inject(PageService);
  private readonly _fb = inject(FormBuilder);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _eventService = inject(EventEndpointService);
  private readonly _inviteService = inject(ShiftPlanInviteEndpointService);
  private readonly _roleService = inject(RoleEndpointService);

  constructor() {
    const eventId = this._route.snapshot.paramMap.get("eventId");
    if(eventId === null) {
      this._router.navigateByUrl("/");
      throw new Error("Event ID is required");
    }

    this.form = this._fb.group({
      shiftPlan: this._fb.nonNullable.control<ShiftPlanDto | null>(null),
      managementMode: this._fb.nonNullable.control<managementMode>("invites")
    });

    this._eventService.getShiftPlansOverviewOfEvent(eventId).pipe(
      tap(event => {
        this._pageService
          .configurePageName(`${event.eventOverview.name}`)
          .configureBreadcrumb(BC_EVENT, event.eventOverview.name, event.eventOverview.id);
      })
    ).subscribe(data => this.event$.next(data));

    this.shiftPlanOptions$ = this.event$.pipe(
      filter(event => event !== undefined),
      map(event => event.shiftPlans.map(plan => ({name: plan.name, value: plan})) as SelectOptions<ShiftPlanDto>),
      shareReplay()
    );

    /* init selection so with hacky delay so that options loaded */
    this.shiftPlanOptions$.pipe(
      take(1),
      delay(100)
    ).subscribe(data => this.form.controls.shiftPlan.setValue(data[0].value));

    /* load plan when selection changes */
    this.planManageData$ = this.event$.pipe(
      filter(event => event !== undefined),
      combineLatestWith(this.form.controls.shiftPlan.valueChanges.pipe(
        startWith(this.form.controls.shiftPlan.value)
      )),
      map(([event, shiftPlan]) => ({plan: shiftPlan ?? undefined, eventId: event.eventOverview.id})),
      shareReplay()
    );

    /* fetch invites when plan changes */
    this.invitesManageData$ = this.planManageData$.pipe(
      switchMap(planData => {
          const plan = planData.plan;
          if (plan === undefined) {
            return of(undefined);
          }

          return this._inviteService.getAllShiftPlanInvites(plan.id).pipe(
            map(invites => [
              {plan: plan, invite: undefined},
              ...invites.map(invite => ({plan: plan, invite: invite}))
            ])
          );
        }
      )
    );

    /* fetch roles when plan changes */
    this.rolesManageData$ = this.planManageData$.pipe(
      switchMap(planData => {
          const plan = planData.plan;
          if (plan === undefined) {
            return of(undefined);
          }

          return this._roleService.getRoles(plan.id).pipe(
            map(invites => [
              {plan: plan, role: undefined},
              ...invites.map(role => ({plan: plan, role: role}))
            ])
          );
        }
      )
    );

    this.mode$ = this.form.controls.managementMode.valueChanges.pipe(
      startWith(this.form.controls.managementMode.value),
      shareReplay()
    );

    this.selectedMode$ = this.mode$.pipe(
      map(value => this.modeOptions.find(mode => mode.value === value)?.name)
    );
  }

  protected idComparatorFn(a: {id: string} | null, b: {id: string} | null): boolean {
    return a?.id === b?.id;
  }

  protected refreshData() {
    this.event$.pipe(
      take(1),
      switchMap(event =>
        event === undefined ? of(undefined) :
        this._eventService.getShiftPlansOverviewOfEvent(event?.eventOverview.id)
      )
    ).subscribe(event => this.event$.next(event));
  }
}
