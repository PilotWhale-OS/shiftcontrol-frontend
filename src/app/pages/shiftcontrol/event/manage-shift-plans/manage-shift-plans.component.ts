import {Component, inject, OnDestroy} from "@angular/core";
import {PageService} from "../../../../services/page/page.service";
import { icons } from "../../../../util/icons";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {
  EventEndpointService,
  EventShiftPlansOverviewDto, RoleEndpointService,
  ShiftPlanDto,
  ShiftPlanInviteEndpointService
} from "../../../../../shiftservice-client";
import {
  BehaviorSubject,
  combineLatestWith,
  debounceTime,
  filter,
  map, of,
  shareReplay, skip,
  startWith,
  Subscription, switchMap,
  take,
  tap
} from "rxjs";
import {BC_EVENT} from "../../../../breadcrumbs";
import {InputMultiToggleComponent, MultiToggleOptions} from "../../../../components/inputs/input-multitoggle/input-multi-toggle.component";
import {AsyncPipe} from "@angular/common";
import {InputSelectComponent, SelectOptions} from "../../../../components/inputs/input-select/input-select.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {TypedFormControlDirective} from "../../../../directives/typed-form-control.directive";
import {ManagePlanDetailsComponent} from "../../../../components/manage-plan-details/manage-plan-details.component";
import {ManageInviteComponent} from "../../../../components/manage-invite/manage-invite.component";
import {ManageRoleComponent} from "../../../../components/manage-role/manage-role.component";

export type managementMode = "details" | "invites" | "assignments" | "users" | "roles";
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
    ManagePlanDetailsComponent,
    ManageInviteComponent,
    ManageRoleComponent
  ],
  templateUrl: "./manage-shift-plans.component.html",
  styleUrl: "./manage-shift-plans.component.scss"
})
export class ManageShiftPlansComponent implements OnDestroy {

  protected readonly form;
  protected readonly event$ = new BehaviorSubject<EventShiftPlansOverviewDto | undefined>(undefined);
  protected readonly planManageData$;
  protected readonly invitesManageData$;
  protected readonly rolesManageData$;
  protected readonly shiftPlanOptions$;
  protected readonly mode$;
  protected readonly icons = icons;

  protected readonly modeOptions: MultiToggleOptions<managementMode> = [
    {name: "Details", value: "details"},
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

  private readonly _formValueSubscription: Subscription;

  constructor() {
    const eventId = this._route.snapshot.paramMap.get("eventId");
    if(eventId === null) {
      this._router.navigateByUrl("/");
      throw new Error("Event ID is required");
    }

    this.form = this._fb.group({
      shiftPlan: this._fb.nonNullable.control<ShiftPlanDto | null>(null),
      managementMode: this._fb.nonNullable.control<managementMode>("details")
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

    /* UI function to disable modes during create */
    this._formValueSubscription = this.form.valueChanges.pipe(
      startWith(this.form.value),
      debounceTime(100)
    ).subscribe(value => {

      /* disable management mode when creating new plan */
      if(value.shiftPlan === null && this.form.controls.managementMode.enabled) {
        this.form.controls.managementMode.setValue("details");
        this.form.controls.managementMode.disable();
      }

      /* enable otherwise */
      if(value.shiftPlan !== null && this.form.controls.managementMode.disabled) {
        this.form.controls.managementMode.enable();
        this.form.controls.managementMode.setValue("details");
      }
    });
  }

  ngOnDestroy(): void {
    this._formValueSubscription.unsubscribe();
  }

  protected idComparatorFn(a: {id: string} | null, b: {id: string} | null): boolean {
    return a?.id === b?.id;
  }

  protected refreshData(navigation: planManagementNavigation) {
    this.planManageData$.pipe(
      take(1),
      switchMap(data => this._eventService.getShiftPlansOverviewOfEvent(data.eventId)),
      combineLatestWith(this.shiftPlanOptions$.pipe(
        skip(1), // skip current options
        take(1), // new one after refresh
        startWith(undefined), // trigger initial emission
      )),
      tap(([event, options]) => {
        if(options === undefined) {
          this.event$.next(event);
        } else {
          if(navigation.navigateTo === null) {
            this.form.controls.shiftPlan.setValue(null);
          } else {
            const plan = navigation.navigateTo;
            const matchingOption = options.find(option => option.value.id === plan.id);
            if(matchingOption !== undefined) {
              setTimeout(() => {
                /* hack so that input has time to load new options */
                this.form.controls.shiftPlan.setValue(matchingOption.value, {emitEvent: true});
                setTimeout(() => {
                  this.form.controls.managementMode.setValue(navigation.mode, {emitEvent: true});
                },100);
              }, 50);
            }
          }
        }
      })
    ).subscribe();
  }
}
