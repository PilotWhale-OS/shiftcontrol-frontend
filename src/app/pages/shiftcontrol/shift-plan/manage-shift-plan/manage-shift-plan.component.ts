import {Component, inject} from "@angular/core";
import {faBook, faCircleInfo, faTag} from "@fortawesome/free-solid-svg-icons";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {PageService} from "../../../../services/page/page.service";
import {BC_EVENT, BC_PLAN_DASHBOARD} from "../../../../breadcrumbs";
import {EventEndpointService, ShiftPlanCollectionEndpointService} from "../../../../../shiftservice-client";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {InputButtonComponent} from "../../../../components/inputs/input-button/input-button.component";
import {InputTextComponent} from "../../../../components/inputs/input-text/input-text.component";
import {TypedFormControlDirective} from "../../../../directives/typed-form-control.directive";
import {ShiftPlanEndpointService} from "../../../../../shiftservice-client/api/shift-plan-endpoint.service";

@Component({
  selector: "app-manage-shift-plan",
  imports: [
    FaIconComponent,
    InputButtonComponent,
    InputTextComponent,
    ReactiveFormsModule,
    TypedFormControlDirective
  ],
  templateUrl: "./manage-shift-plan.component.html",
  styleUrl: "./manage-shift-plan.component.scss"
})
export class ManageShiftPlanComponent {

  public readonly form;

  protected readonly iconName = faTag;
  protected readonly iconCaption = faCircleInfo;
  protected readonly iconDescription = faBook;

  protected readonly planId?: string;
  protected readonly eventId?: string;

  private readonly _fb = inject(FormBuilder);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _pageService = inject(PageService);
  private readonly _eventService = inject(EventEndpointService);
  private readonly _planCollectionService = inject(ShiftPlanCollectionEndpointService);
  private readonly _planService = inject(ShiftPlanEndpointService);

  constructor() {
    this.form = this._fb.group({
      name: this._fb.nonNullable.control<string>("", [Validators.maxLength(30), Validators.required]),
      shortDescription: this._fb.nonNullable.control<string>("", [Validators.maxLength(100)]),
      longDescription: this._fb.nonNullable.control<string>("", [Validators.maxLength(1000)])
    });

    const planId = this._route.snapshot.paramMap.get("planId") ?? undefined;
    const eventId = this._route.snapshot.paramMap.get("eventId") ?? undefined;
    this.planId = planId;
    this.eventId = eventId;

    if(planId !== undefined) {
      this._planService.getShiftPlanDashboard(planId).subscribe(dashboard => {
        this._pageService
          .configurePageName(`${dashboard.shiftPlan.name}`)
          .configureBreadcrumb(BC_EVENT, dashboard.eventOverview.name, dashboard.eventOverview.id)
          .configureBreadcrumb(BC_PLAN_DASHBOARD, dashboard.shiftPlan.name, `/plans/${dashboard.shiftPlan.id}`);
      });
    } else if(eventId !== undefined) {
      this._eventService.getEventById(eventId).subscribe((event) => {
        this._pageService
          .configureBreadcrumb(BC_EVENT, event.name, event.id);
      });
    } else {
      throw new Error("Either planId or eventId must be provided in the route parameters");
    }

  }

  protected create() {
    if(this.eventId === undefined || this.planId !== undefined) {
      throw new Error("Cannot create plan without eventId or planId already exists");
    }

    this.form.markAllAsTouched();

    if(this.form.valid) {
      this._planCollectionService.createShiftPlan(this.eventId, {
        name: this.form.controls.name.value,
        shortDescription: this.form.controls.shortDescription.value,
        longDescription: this.form.controls.longDescription.value
      }).subscribe({
        next: (plan) => {
          this._router.navigateByUrl(`/plans/${plan.id}`);
        }
      });
    }
  }

  protected update() {
    if(this.planId === undefined || this.eventId !== undefined) {
      throw new Error("Cannot update plan without planId or eventId must be undefined");
    }

  }
}
