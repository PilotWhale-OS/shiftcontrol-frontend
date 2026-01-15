import {Component, inject} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ShiftPlanDashboardOverviewDto, ShiftPlanDto, ShiftPlanEndpointService} from "../../../../shiftservice-client";
import {BC_EVENT, BC_PLAN_DASHBOARD} from "../../../breadcrumbs";
import {PageService} from "../../../services/page/page.service";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";
import {BehaviorSubject} from "rxjs";
import {AsyncPipe} from "@angular/common";
import LockStatusEnum = ShiftPlanDto.LockStatusEnum;
import {ToastService} from "../../../services/toast/toast.service";

@Component({
  selector: "app-shift-signup-dashboard",
  imports: [
    InputButtonComponent,
    AsyncPipe
  ],
  templateUrl: "./shift-plan-signup-dashboard.component.html",
  styleUrl: "./shift-plan-signup-dashboard.component.scss"
})
export class ShiftPlanSignupDashboardComponent {

  protected readonly dashboard$ = new BehaviorSubject<ShiftPlanDashboardOverviewDto | null>(null);


  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _planService = inject(ShiftPlanEndpointService);
  private readonly _pageService = inject(PageService);
  private readonly _toastService = inject(ToastService);

  constructor() {
    const shiftPlanId = this._route.snapshot.paramMap.get("shiftPlanId");
    if(shiftPlanId === null) {
      this._router.navigateByUrl("/");
      throw new Error("Shift Plan ID is required");
    }

    this._planService.getShiftPlanDashboard(shiftPlanId).subscribe(plan => {
      this._pageService
        .configurePageName(`${plan.shiftPlan.name} Signups`)
        .configureBreadcrumb(
          BC_EVENT,
          plan.eventOverview.name,
          plan.eventOverview.id
        )
        .configureBreadcrumb(
          BC_PLAN_DASHBOARD,
          plan.shiftPlan.name,
          `/plans/${plan.shiftPlan.id}`
        );

      this.dashboard$.next(plan);
    });
  }

  protected toggleLockStatus(dashboard: ShiftPlanDashboardOverviewDto) {
    const newStatus = dashboard.shiftPlan.lockStatus === LockStatusEnum.Supervised ? LockStatusEnum.SelfSignup : LockStatusEnum.Supervised;
    this._planService.editLockStatus(dashboard.shiftPlan.id, {
      lockStatus: newStatus
    }).pipe(
      this._toastService.tapSaving("Lock Status", () => newStatus),
    ).subscribe();
  }

}
