import {Component, inject} from "@angular/core";
import {PageService} from "../../../services/page/page.service";
import {BC_EVENT, BC_PLAN_DASHBOARD, BC_PLAN_ONBOARDING} from "../../../breadcrumbs";
import {InputButtonComponent} from "../../../components/inputs/input-button/input-button.component";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {ShiftPlanInviteDto, ShiftPlanInviteEndpointService, ShiftPlanInviteDetailsDto} from "../../../../shiftservice-client";
import {BehaviorSubject, map} from "rxjs";
import {AsyncPipe, DatePipe} from "@angular/common";
import {TooltipDirective} from "../../../directives/tooltip.directive";
import {icons} from "../../../util/icons";

@Component({
  selector: "app-plan-onboarding",
  imports: [
    InputButtonComponent,
    RouterLink,
    FaIconComponent,
    AsyncPipe,
    TooltipDirective,
    DatePipe
  ],
  standalone: true,
  templateUrl: "./plan-onboarding.component.html",
  styleUrl: "./plan-onboarding.component.scss"
})
export class PlanOnboardingComponent {

  protected readonly icons = icons;
  protected readonly invite$ = new BehaviorSubject<ShiftPlanInviteDetailsDto | null | "INVALID">(null);
  protected readonly inviteMode$ = this.invite$.pipe(
    map(invite => {
      if(invite === null) {return null;}
      if(invite === "INVALID") {return "INVALID";}
      if(!invite.joined) {return "JOIN";}
      if(invite.upgradeToPlannerPossible) {return "UPGRADE_ACCESS";}
      if(invite.extensionOfRolesPossible) {return "UPGRADE_ROLES";}
      return "JOINED";
    })
  );

  private readonly _pageService = inject(PageService);
  private readonly _planService = inject(ShiftPlanInviteEndpointService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  constructor() {
    const inviteCode = this._activatedRoute.snapshot.paramMap.get("shiftPlanInvite");
    if(inviteCode === null) {
      this._router.navigateByUrl("/");
      return;
    }

    this._planService.getShiftPlanInviteDetails(inviteCode).subscribe({
      next: details => {
        this.invite$.next(details);
        this._pageService
          .configurePageName(`Join ${details.inviteDto.shiftPlanDto.name}`)
          .configureBreadcrumb(
            BC_EVENT,
            details.eventDto.name,
            details.eventDto.id
          )
          .configureBreadcrumb(
            BC_PLAN_DASHBOARD,
            details.inviteDto.shiftPlanDto.name,
            `/plans/${details.inviteDto.shiftPlanDto.id}`
          )
          .configureBreadcrumb(
            BC_PLAN_ONBOARDING,
            "Onboarding",
            "/onboarding/" + inviteCode
          );
      },
      error: () => {
        this.invite$.next("INVALID");
      }
    });
  }

  joinShiftPlan(invite: ShiftPlanInviteDto) {
    this._planService.joinShiftPlan({
      inviteCode: invite.code
    }).subscribe(() => {
      this._router.navigateByUrl(`/plans/${invite.shiftPlanDto.id}`);
    });
  }
}
